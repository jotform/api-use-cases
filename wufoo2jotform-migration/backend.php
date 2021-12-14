<?php
/*
	This backend.php is a general purpose intependend task executer, solely written for wufoo2jotform migration wizard.
	Functions put here not to litter requestServer.php, this backend functionality could be implemented 3rd party since
	it will not use DB access. ITs sole role is to read from Wufoo api and post the data to Jotform api. 
*/
session_start();
$method = $_REQUEST["m"];

@$wapikey = $_REQUEST["wapikey"];
@$wusername = $_REQUEST["wusername"];
@$japiKey = $_COOKIE["japiKey"];
@$jusername = $_COOKIE["jusername"];

if(stripos($_SERVER["HTTP_HOST"],".jotform.pro") !== false){ //allow development accounts to use migration
	$jotformAPIHostName = $_SERVER["HTTP_HOST"]."/API";
}else{
	$jotformAPIHostName = "api.jotform.com";
}


$responder = new very_simple_responder($wapikey,$wusername);

if(method_exists($responder, $method)){

	$check = new ReflectionMethod('very_simple_responder', $method);
	if($check->isPublic()){
		echo json_encode($responder->{$method}());	
	}else{
		echo json_encode(array("status" => "error","reason" => "Given method name $method is not publicly accessible"));
	}

	
}else{
	echo json_encode(array("status" => "error","reason" => "Given method name $method does not implemented yet"));
}

/*
	simple responder classi will have static functions

	used class to check if method exists or not

	all functions will return the required result in a form of array or std class

*/
class very_simple_responder{

	private $curl;
	private $wufoo_api_key;
	private $wufoo_username;

	public function __construct($wak,$wu){
		$this->wufoo_api_key = $wak;
		$this->wufoo_username = $wu;
	}
	/*
		Public Methods
	*/
	/*
		Simple test function
	*/
	public function hi(){
		return array("yeppa");
	}

	public function checkWufooCredentials(){
		global $jotformAPIHostName;
		$url = "https://".$this->wufoo_username.".wufoo.com/api/v3/forms.json";
		$retVal =  array("data" => $this->checkWufooCredentialsB($url));

		//also fetch JotForm user details and store it in session it will be usefull later
		$joturl ="http://$jotformAPIHostName/user";
		$tmp = json_decode($this->getJotAuthenticated($joturl),true);

		$_SESSION["migration_user"] = $tmp["content"];
		return $retVal;
	}
	/*
		returns array(
					"formCount" => 5,
					"submissionsCount" => 542
				)
	*/
	public function getWufooStatus(){
		$wforms = $this->getWufooForms();
		$ret = array(
			"formCount" => 0,
			"submissionsCount" => 0
		);
		$ret["formCount"] = count($wforms->Forms);
		foreach($wforms->Forms as $form){
			$tmp = $this->getWufooFormEntryCount($form->Hash);
			$ret["submissionsCount"]+= intval($tmp->EntryCount);
		}
		return $ret;
	}

	public function getWufooFormsWithCount(){
		$wforms = $this->getWufooForms();
		$ret = array(

		);
		foreach($wforms->Forms as $form){
			$tmp = $this->getWufooFormEntryCount($form->Hash);
			$ret[$form->Hash] = intval($tmp->EntryCount);
		}
		return $ret;
	}

	/*
		moves given form to JotForm
		//also stores wufoo output of form structure to SESSION for later use at migrating submissions
	*/
	public function migrateFormToJotForm(){
		global $jotformAPIHostName;
		$formHash = $_REQUEST["formHash"];

		//get form questions structure from wufoo
		$url = "https://{$this->wufoo_username}.wufoo.com/api/v3/forms/$formHash/fields.json";
		$wufooQuestionsStructure = json_decode($this->getAuthenticated($url),true);

		//save formStructure to SESSION[] array for later usage in migrate SubmissionsToJotForm
		$_SESSION[sha1("wufooMigration".$formHash)] = base64_encode(json_encode($wufooQuestionsStructure));

		//get form basic structure from wufoo
		$url = "https://{$this->wufoo_username}.wufoo.com/api/v3/forms/$formHash.json";
		$wufooFormStructure = json_decode($this->getAuthenticated($url),true);
		//create form at JotForm
		//populate form_properties array from $wufooFormStructure
		$jotformBasicFormProperties = $this->getDefaultFormProperties();
		$jotformBasicFormProperties[] = array('type' => '',			'prop' => 'title','value' => $wufooFormStructure["Forms"][0]["Name"]);

		$replacements = array(
			"{UserEmail}" => $_SESSION["migration_user"]["email"]
		);
		foreach ($jotformBasicFormProperties as $key => $value) {
			foreach ($replacements as  $repkey => $repval) {
				$jotformBasicFormProperties[$key]["value"] = str_replace($repkey, $repval, $value["value"]);
			}
		}//yup we are done with replacements
		

		//now create question properties using $wufooQUestionsStructure array, 
		$question_properties = array();
		foreach($wufooQuestionsStructure["Fields"] as $wquestion){
			if(!array_key_exists("IsRequired", $wquestion)){
				continue; // to by pass submission id place holder
			}
			$question_properties[]=$this->getQuestionPropertyArrayForSingleQuestion($wquestion);

		}
		$len = count($question_properties);
		$question_properties[]=$this->getSubmitButtonProps($len+1,"Submit"); //add submit button because it is cool


		//update email template according to question properties
		

		//now we have both question_properties and JotFormBasicFormProperties let pass them to JotForm api and create our FORM!
		$jotformFormStructure = array();

		//normalize jotformBasicFormProperties and question properties to make them compatiable with jotform api PUT /user/forms
		/*
			put form_properties into form, and inside form_properties emails and formStrings must be seperated
			ffffffgggff
			
		*/
		$formDetails = $this->normalizeForJotForm($jotformBasicFormProperties,$question_properties); //send formDetails,

		//echo "<pre>";
		//var_dump($formDetails);
		//echo json_encode($formDetails);

		
		$jotSubmissionsPostUrl="http://$jotformAPIHostName/user/forms";
		//echo "<pre>";
		//var_dump($jotSubmissionsPostParameters);
		$postResult = $this->putJotAuthenticated($jotSubmissionsPostUrl,$formDetails);
		//echo "result of POST <br /><pre>";
		$tmp = json_decode($postResult,true);
		//var_dump($tmp);
		$newFormId = $tmp["content"]["id"];
		
		return array("result" => "migration of $formHash form has completed","formId" => $newFormId, "oldId" => $formHash);
	}


	/*
		moves given form to JotForm

		//TODO: pass Jotform Form ID to this request handler ASAP
	*/
	public function migrateSubmissionsToJotForm(){
		global $jotformAPIHostName;
		$formHash = $_REQUEST["formHash"];
		$pageStart = $_REQUEST["pageStart"];
		$pageSize = $_REQUEST["pageSize"];
		$newFormId = $_REQUEST["newFormId"];
		//https://cettox.wufoo.com/api/v3/forms/s7x1s7/entries.json?pageStart=2&pageSize=2
		$url = "https://".$this->wufoo_username.".wufoo.com/api/v3/forms/".$formHash."/entries.json?pageStart=".$pageStart."&pageSize=".$pageSize;
		$jotAPI = $_COOKIE["jotApi"];
		//get form's wufoo structure from SESSION
		$wufooFormStructure = json_decode(base64_decode($_SESSION[sha1("wufooMigration".$formHash)]),true);
		//var_dump($wufooFormStructure);

		//prepare POST variables for jotform API 
		//fetch submissions fieldIDS and fieldTypes from $wufooFormStructure
		$fields = array();
		$qid = 1;
		//echo "<pre>";
		foreach($wufooFormStructure["Fields"] as $wfs){
			//var_dump($wfs);
			if(array_key_exists("Type", $wfs) && array_key_exists("IsRequired", $wfs)  ){ //on process field array if it has TYPE subkey
				$type = $wfs["Type"];
				//if it has subFields add them too
				if(array_key_exists("SubFields", $wfs)){
					foreach($wfs["SubFields"] as $sf){
						$sflabel = $sf["Label"];
						$sfID = str_replace("Field", "", $sf["ID"]); //thiswill be our ID in q{ID}

						$fields[$sf["ID"]]=array(
							"label" => $sflabel,
							"jotkey" => $qid, 
							"type" => "sub", 
							"subLabel" => $this->subLabelMap($sflabel,$type)
						);
					}
				}else{ //this field does not has a subField
					$fields[$wfs["ID"]] = array(
						"label" =>  $wfs["Title"],
						"jotkey" => "$qid",
						"type" => "main"
					);
				}
				$qid++;
			}
		}
		//we have now Wufoo Structure that we can use to map wufoo entries api output to create
		//jotform submissions POST api POST variables
		//fetch WuFoo Entries
		//var_dump($fields);
		$url = "https://{$this->wufoo_username}.wufoo.com/api/v3/forms/$formHash/entries.json?pageStart=$pageStart&pageSize=$pageSize";
		$entriesResult = json_decode($this->getAuthenticated($url),true);
		
		$postResult = array();
		$sc = 1;
		//echo "<pre>";
		$jotSubmissionsPostParameters = array();
		foreach($entriesResult["Entries"] as $wufooEntry){
			$sc++; //increment sc(submissioncount) to 1 let it start from 1
			$jotSubmissionsPostParameters[$sc] = array();
			//echo "testing following entry\n";
			//var_dump($wufooEntry);
			foreach($wufooEntry as $entryKey => $entryValue){
				//echo "testing entry value $entryKey => $entryValue \n";
				//only the entryKeys of the format Field{ID} is required
				if(strpos($entryKey, "Field") === false){continue;}
				$tmp_key = str_replace("Field", "", $entryKey);

				if($fields[$entryKey]["type"] == "sub"){
					//echo "$sc , {$fields[$entryKey]["jotkey"]} <br />\n";
					//debugCode Start
					if(!array_key_exists($fields[$entryKey]["jotkey"], $jotSubmissionsPostParameters[$sc])){
						$jotSubmissionsPostParameters[$sc][$fields[$entryKey]["jotkey"]] = array();
						//var_dump($jotSubmissionsPostParameters[$sc]);
					}//debugCode End

					if(!is_array($jotSubmissionsPostParameters[$sc][$fields[$entryKey]["jotkey"]])){
						$jotSubmissionsPostParameters[$sc][$fields[$entryKey]["jotkey"]] = array();
					}
					$jotSubmissionsPostParameters[$sc][$fields[$entryKey]["jotkey"]][$fields[$entryKey]["subLabel"]] = urlencode($entryValue);
				}else{
					$jotSubmissionsPostParameters[$sc][$fields[$entryKey]["jotkey"]] = urlencode($entryValue);
				}

				
			}
		}
		//JotForm POST parameters is set, relay it to Jotform using PUT
		//TODO do'a batch request here!!!!! This is so slow!!!
		$jotSubmissionsPostUrl="http://$jotformAPIHostName/form/$newFormId/submissions";
		//var_dump($jotSubmissionsPostParameters);
		$postResult = $this->putJotAuthenticated($jotSubmissionsPostUrl,$jotSubmissionsPostParameters);

		return array("result"=> array("str"=>"operationCompleted","response"=>$postResult));
	}



	/*
		Private Methods
	*/

	/*
		private 
	*/
	private function getWufooForms(){
		$url = "https://".$this->wufoo_username.".wufoo.com/api/v3/forms.json";
		return json_decode($this->getAuthenticated($url));
	}

	private function getWufooForm($fid = false){
		if(!$fid)$fid=$_REQUEST["fid"];
		$url = "https://".$this->wufoo_username.".wufoo.com/api/v3/forms/$fid.json";
		return json_decode($this->getAuthenticated($url));
	}

	private function getWufooFormEntryCount($fid = false){
		if(!$fid)$fid=$_REQUEST["fid"];
		$url = "https://".$this->wufoo_username.".wufoo.com/api/v3/forms/$fid/entries/count.json";
		return json_decode($this->getAuthenticated($url));
	}

	/*
		
		retrieves wufoo sublabel and question type and maps return jotform sublabel

	*/
	private function subLabelMap($wlabel,$wtype){
		$map = array(
			"text" => array(
				"First" => "first",
				"Last" => "last"
			),
			"address" => array(
				"Street Address" => "addr_line1",
				"Address Line 2" => "addr_line2",
				"City"			=> "city",
				"State / Province / Region" => "state",
				"Postal / Zip Code" => "postal",
				"Country" => "country"
			)
		);

		if(!array_key_exists($wtype, $map)){
			return $wlabel;
		}

		if(!array_key_exists($wlabel, $map[$wtype])){
			return $wlabel;
		}

		return $map[$wtype][$wlabel];
	}

	/*
		
		normalizes jotform db style form&question properties into jotform api compatible formDetails array
		
	*/
	private function normalizeForJotForm($JotFormBasicFormProperties,$question_properties){
		$formDetails = array();
		$formDetails["questions"] = array();
		$formDetails["properties"] = array();
		$formDetails["emails"] = array();
		$formDetails["formStrings"] = array();


		foreach($JotFormBasicFormProperties as $fp){
			if($fp["type"] == "emails"){
				$formDetails["emails"][$fp["prop"]]=$fp["value"];
			}elseif($fp["type"] == "formStrings"){
				$formDetails["formStrings"][$fp["prop"]]=$fp["value"];
			}elseif(empty($fp["type"])){
				$formDetails["properties"][$fp["prop"]]=$fp["value"];
			}else{
				//for now put them into form too
				$formDetails["properties"][$fp["prop"]]=$fp["value"];
			}
		}

		foreach($question_properties as $key => $qp){

			$sd = array();
			foreach($qp as $qqq) {

				$tmp_key = $qqq["prop"];
				$sd [$tmp_key]  = $qqq["value"];
			}
			$formDetails["questions"][$key] = $sd;
		}

		return $formDetails;
	}

	/*
		Parts required for JotForm PHP api interaction
	*/

	/*
		Authentication could be achieved by sending the $_COOKIE["jotApi"] 
		and  $_SERVER['HTTP_USER_AGENT'] parameter using curl
	*/
	private function putJotApiKeyToUrl($url){
		global $japiKey,$jusername;
		return $url."&apiKey=$japiKey";
	}	

	private function getJotAuthenticated($url){
		$url = self::putJotApiKeyToUrl($url);
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		$response = curl_exec($curl);
		$http_status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		return $response;
	}

	private function postJotAuthenticated($url,$postParams){
		$url = self::putJotApiKeyToUrl($url);
		
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $postParams);	
		$response = curl_exec($curl);
		$http_status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		return $response;
	}

	private function putJotAuthenticated($url,$putParams){
		$url = self::putJotApiKeyToUrl($url);
		$curl = curl_init();
	    
	    
	    $putString = json_encode($putParams);
	    
	    $putData = tmpfile();
	    fwrite($putData, $putString);
	    fseek($putData, 0);

	    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	    curl_setopt($curl, CURLOPT_URL, $url);
	    curl_setopt($curl, CURLOPT_PUT, true);
	    curl_setopt($curl, CURLOPT_INFILE, $putData);
	    curl_setopt($curl, CURLOPT_INFILESIZE, strlen($putString));
	    
	    $output = curl_exec($curl);
	    //var_dump($output);
	    
	    fclose($putData);
	    curl_close($curl);
	    return $output;
	}

	/*

		Parts copied from wufoo php  
	*/
	private function getAuthenticated($url) {
		$apiKey = $this->wufoo_api_key;
		$this->curl = curl_init($url);
		$this->setBasicCurlOptionsW();

		curl_setopt($this->curl, CURLOPT_USERPWD, $apiKey.':footastical');

		$response = curl_exec($this->curl);
		$http_status = curl_getinfo($this->curl, CURLINFO_HTTP_CODE);
		curl_close($this->curl);

		return $response;
	}

	private function checkWufooCredentialsB($url){
		$apiKey = $this->wufoo_api_key;
		$this->curl = curl_init($url);
		$this->setBasicCurlOptionsW();

		curl_setopt($this->curl, CURLOPT_USERPWD, $apiKey.':footastical');

		$response = curl_exec($this->curl);
		$http_status = curl_getinfo($this->curl, CURLINFO_HTTP_CODE);
		curl_close($this->curl);
		if($http_status == 200){
			return true;
		}else{
			return false;
		}
	}

	private function postAuthenticatedW($postParams, $url, $apiKey) {
		$this->curl = curl_init($url);
		$this->setBasicCurlOptionsW();

		curl_setopt($this->curl, CURLOPT_HTTPHEADER, array('Content-type: multipart/form-data', 'Expect:'));
		curl_setopt($this->curl, CURLOPT_POST, true);
		curl_setopt($this->curl, CURLOPT_POSTFIELDS, $postParams);	
		curl_setopt($this->curl, CURLOPT_USERPWD, $apiKey.':footastical');
		$response = curl_exec($this->curl);
		$http_status = curl_getinfo($this->curl, CURLINFO_HTTP_CODE);
		curl_close($this->curl);
		return $response;
	}

	private function setBasicCurlOptionsW() {
		//http://bugs.php.net/bug.php?id=47030
		curl_setopt($this->curl, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($this->curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($this->curl, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($this->curl, CURLOPT_USERAGENT, 'Wufoo API Wrapper');
		curl_setopt($this->curl, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
	}

	/*
		This values are created by JotForm whenever an empty form was created and saved

		This properties should be edited using Wufoo basic Form Structure Data!

		Also the type emails and prop=body propery which contains default HTML tpl, should be updated using the questions fetched from Wufoo
	*/
	private function getDefaultFormProperties(){
		$form_properties = array(
			  array('type' => '',			'prop' => 'activeRedirect','value' => 'default'),
			  array('type' => '',			'prop' => 'alignment','value' => 'Left'),
			  array('type' => '',			'prop' => 'defaultEmailAssigned','value' => 'Yes'),
			  array('type' => '',			'prop' => 'expireDate','value' => 'No Limit'),
			  array('type' => '',			'prop' => 'font','value' => 'Lucida Grande'),
			  array('type' => '',			'prop' => 'fontcolor','value' => '#555'),
			  array('type' => '',			'prop' => 'fontsize','value' => '14'),
			  array('type' => '',			'prop' => 'formWidth','value' => '690'),
			  array('type' => '',			'prop' => 'hash','value' => ''),
			  array('type' => '',			'prop' => 'hideMailEmptyFields','value' => 'disable'),
			  array('type' => '',			'prop' => 'highlightLine','value' => 'Enabled'),
			  array('type' => '',			'prop' => 'id','value' => ''),
			  array('type' => '',			'prop' => 'labelWidth','value' => '150'),
			  array('type' => '',			'prop' => 'limitSubmission','value' => 'No Limit'),
			  array('type' => '',			'prop' => 'lineSpacing','value' => '12'),
			  array('type' => '',			'prop' => 'messageOfLimitedForm','value' => 'This form is currently unavailable!'),
			  array('type' => '',			'prop' => 'optioncolor','value' => '#000'),
			  array('type' => '',			'prop' => 'pagetitle','value' => 'Form'),
			  array('type' => '',			'prop' => 'sendpostdata','value' => 'No'),
			  array('type' => '',			'prop' => 'styles','value' => 'nova'),
			  array('type' => '',			'prop' => 'unique','value' => 'None'),
			  array('type' => '',			'prop' => 'uniqueField','value' => '<Field Id>'),
			  array('type' => 'autoFill',	'prop' => 'bindChange','value' => 'on'),
			  array('type' => 'autoFill',	'prop' => 'menu','value' => 'disable'),
			  array('type' => 'autoFill',	'prop' => 'timeout','value' => '4'),
			  array('type' => 'autoFill',	'prop' => 'ttl','value' => '86400'),
			  array('type' => 'emails',		'prop' => 'body','value' => '<html><body bgcolor="#f7f9fc" class="Created on Form Builder">
			    <table bgcolor="#f7f9fc" width="100%" border="0" cellspacing="0" cellpadding="0">
			    <tr>
			      <td height="30">&nbsp;</td>
			    </tr>
			    <tr>
			      <td align="center"><table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#eeeeee" >
			        <tr>
			          <td width="13" height="30" background="http://www.jotform.com/images/win2_title_left.gif"></td>
			          <td align="left" background="http://www.jotform.com/images/win2_title.gif" valign="bottom"><img style="float:left" src="http://www.jotform.com/images/win2_title_logo.gif" width="63" height="26" alt="jotform.com" /></td>
			          <td width="14" background="http://www.jotform.com/images/win2_title_right.gif"></td>
			        </tr>
			      </table>
			      <table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#eeeeee" >
			        <tr>
			          <td width="4" background="http://www.jotform.com/images/win2_left.gif"></td>
			          <td align="center" bgcolor="#FFFFFF">
			          <table width="100%" border="0" cellspacing="0" cellpadding="5">
			          <tr>
			              <td bgcolor="#f9f9f9" width="170" style="text-decoration:underline; padding:5px !important;"><b>Question</b></td>
			              <td bgcolor="#f9f9f9" style="text-decoration:underline; padding:5px !important;"><b>Answer</b></td>
			          </tr>
			            </table>
			          </td>
			          <td width="4" background="http://www.jotform.com/images/win2_right.gif"></td>
			        </tr>
			        <tr>
			          <td height="4" background="http://www.jotform.com/images/win2_foot_left.gif" style="font-size:4px;"></td>
			          <td background="http://www.jotform.com/images/win2_foot.gif" style="font-size:4px;"></td>
			          <td background="http://www.jotform.com/images/win2_foot_right.gif" style="font-size:4px;"></td>
			        </tr>
			      </table></td>
			    </tr>
			    <tr>
			      <td height="30">&nbsp;</td>
			    </tr>
			  </table><br /><br /><p></p></body></html><pre>
			'),
			  array('type' => 'emails',		'prop' => 'from','value' => 'default'),
			  array('type' => 'emails',		'prop' => 'html','value' => '1'),
			  array('type' => 'emails',		'prop' => 'name','value' => 'Notification'),
			  array('type' => 'emails',		'prop' => 'subject','value' => 'New submission: {form_title}'),
			  array('type' => 'emails',		'prop' => 'to','value' => '{UserEmail}'),
			  array('type' => 'emails',		'prop' => 'type','value' => 'notification'),
			  array('type' => 'formStrings','prop' => 'alphabetic','value' => 'This field can only contain letters.'),
			  array('type' => 'formStrings','prop' => 'alphanumeric','value' => 'This field can only contain letters and numbers.'),
			  array('type' => 'formStrings','prop' => 'confirmClearForm','value' => 'Are you sure you want to clear the form?'),
			  array('type' => 'formStrings','prop' => 'confirmEmail','value' => 'E-mail does not match'),
			  array('type' => 'formStrings','prop' => 'email','value' => 'Enter a valid e-mail address'),
			  array('type' => 'formStrings','prop' => 'gradingScoreError','value' => 'Score total should only be less than or equal to'),
			  array('type' => 'formStrings','prop' => 'incompleteFields','value' => 'è˜‡'),
			  array('type' => 'formStrings','prop' => 'inputCarretErrorA','value' => 'Input should not be less than the minimum value:'),
			  array('type' => 'formStrings','prop' => 'inputCarretErrorB','value' => 'Input should not be greater than the maximum value:'),
			  array('type' => 'formStrings','prop' => 'lessThan','value' => 'Your score should be less than or equal to'),
			  array('type' => 'formStrings','prop' => 'maxDigitsError','value' => 'The maximum digits allowed is'),
			  array('type' => 'formStrings','prop' => 'numeric','value' => 'This field can only contain numeric values'),
			  array('type' => 'formStrings','prop' => 'pleaseWait','value' => 'Please wait...'),
			  array('type' => 'formStrings','prop' => 'required','value' => 'This field is required.'),
			  array('type' => 'formStrings','prop' => 'requireEveryRow','value' => 'Every row is required.'),
			  array('type' => 'formStrings','prop' => 'requireOne','value' => 'At least one field required.'),
			  array('type' => 'formStrings','prop' => 'submissionLimit','value' => 'Sorry! Only one entry is allowed.  Multiple submissions are disabled for this form.'),
			  array('type' => 'formStrings','prop' => 'uploadExtensions','value' => 'You can only upload following files:'),
			  array('type' => 'formStrings','prop' => 'uploadFilesize','value' => 'File size cannot be bigger than:')
			);
		return $form_properties;
	}

	/*
		this function receives wufoo question structure array for single question and

		creates question property array from that array

		following types are converted
			"control_textbox" => "text",
			"control_textarea" => "textarea",
			"control_number" => "number",
			"control_checkbox" => "checkbox",
			"control_radio" => "radio",
			"control_dropdown" => "select",
			"control_fullname" => "shortname",
			"control_address" => "address",
			"control_email" => "email",
			"control_phone" => "phone",
			"control_datetime" => "date",
			"control_time" => "time",
			"control_matrix" => "likert"
	*/
	private function getQuestionPropertyArrayForSingleQuestion($wufooQuestionStructure){
		$type = $wufooQuestionStructure["Type"];
		$ID = $wufooQuestionStructure["ID"];
		$qid = str_replace("Field", "", $ID);
		$text = $wufooQuestionStructure["Title"];
		$name = $this->getNameFromText($text);
		$isRequired = $wufooQuestionStructure["IsRequired"];
		$required = ($isRequired === "0")?"No":"Yes";
		switch($type){
			case "url": //the only field that jotform does not has!
			case "text":
				$question_properties = array(
						  array('question_id' => "$qid"	,'prop' => 'hint'				,'value' => ' '),
						  array('question_id' => "$qid"	,'prop' => 'labelAlign'			,'value' => 'Auto'),
						  array('question_id' => "$qid"	,'prop' => 'name'				,'value' => $name),
						  array('question_id' => "$qid"	,'prop' => 'order'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'qid'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'readonly'			,'value' => ''),
						  array('question_id' => "$qid"	,'prop' => 'required'			,'value' => $required),
						  array('question_id' => "$qid"	,'prop' => 'size'				,'value' => '20'),
						  array('question_id' => "$qid"	,'prop' => 'text'				,'value' => $text),
						  array('question_id' => "$qid"	,'prop' => 'type'				,'value' => 'control_textbox'),
						  array('question_id' => "$qid"	,'prop' => 'validation'			,'value' => 'None')
				);
				break;
			case "textarea":
				$question_properties = array(
						  array('question_id' => "$qid"	,'prop' => 'cols',				'value' => '40'),
						  array('question_id' => "$qid"	,'prop' => 'entryLimit',		'value' => 'None-0'),
						  array('question_id' => "$qid"	,'prop' => 'labelAlign',		'value' => 'Auto'),
						  array('question_id' => "$qid"	,'prop' => 'name',				'value' => $name),
						  array('question_id' => "$qid"	,'prop' => 'order',				'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'qid',				'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'readonly',			'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'required',			'value' => $required),
						  array('question_id' => "$qid"	,'prop' => 'rows',				'value' => '6'),
						  array('question_id' => "$qid"	,'prop' => 'text',				'value' => $text),
						  array('question_id' => "$qid"	,'prop' => 'type',				'value' => 'control_textarea'),
						  array('question_id' => "$qid"	,'prop' => 'validation',		'value' => 'None'),
						  array('question_id' => "$qid"	,'prop' => 'wysiwyg',			'value' => 'Disable'));
				break;
			case "number":
				$question_properties = array(
						  array('question_id' => "$qid"	,'prop' => 'hint',				'value' => 'ex: 23'),
						  array('question_id' => "$qid"	,'prop' => 'labelAlign',		'value' => 'Auto'),
						  array('question_id' => "$qid"	,'prop' => 'name',				'value' => $name),
						  array('question_id' => "$qid"	,'prop' => 'order',				'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'qid',				'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'readonly',			'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'required',			'value' => $required),
						  array('question_id' => "$qid"	,'prop' => 'size',				'value' => '5'),
						  array('question_id' => "$qid"	,'prop' => 'text',				'value' => $text),
						  array('question_id' => "$qid"	,'prop' => 'type',				'value' => 'control_number'));
				break;
			case "checkbox":
				$options = array();
				foreach($wufooQuestionStructure["SubFields"] as $sf){
					$options[]=$sf["Label"];
				}
				$question_properties = array(
						  array('question_id' => "$qid"	,'prop' => 'allowOther'			,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'labelAlign'			,'value' => 'Auto'),
						  array('question_id' => "$qid"	,'prop' => 'name'				,'value' => $name),
						  array('question_id' => "$qid"	,'prop' => 'options'			,'value' => implode("|",$options)),
						  array('question_id' => "$qid"	,'prop' => 'order'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'otherText'			,'value' => 'Other'),
						  array('question_id' => "$qid"	,'prop' => 'qid'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'required'			,'value' => $required),
						  array('question_id' => "$qid"	,'prop' => 'special'			,'value' => 'None'),
						  array('question_id' => "$qid"	,'prop' => 'spreadCols'			,'value' => '1'),
						  array('question_id' => "$qid"	,'prop' => 'text'				,'value' => $text),
						  array('question_id' => "$qid"	,'prop' => 'type'				,'value' => 'control_checkbox'));
				break;
			case "radio":
				$options = array();
				foreach($wufooQuestionStructure["Choices"] as $sf){
					$options[]=$sf["Label"];
				}
				$question_properties = array(
						  array('question_id' => "$qid"	,'prop' => 'allowOther'			,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'labelAlign'			,'value' => 'Auto'),
						  array('question_id' => "$qid"	,'prop' => 'name'				,'value' => $name),
						  array('question_id' => "$qid"	,'prop' => 'options'			,'value' => implode("|",$options)),
						  array('question_id' => "$qid"	,'prop' => 'order'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'otherText'			,'value' => 'Other'),
						  array('question_id' => "$qid"	,'prop' => 'qid'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'required'			,'value' => $required),
						  array('question_id' => "$qid"	,'prop' => 'special'			,'value' => 'None'),
						  array('question_id' => "$qid"	,'prop' => 'spreadCols'			,'value' => '1'),
						  array('question_id' => "$qid"	,'prop' => 'text'				,'value' => $text),
						  array('question_id' => "$qid"	,'prop' => 'type'				,'value' => 'control_radio'));
				break;
			case "select":
				$options = array();
				foreach($wufooQuestionStructure["Choices"] as $sf){
					$options[]=$sf["Label"];
				}
				$question_properties = array(
						  array('question_id' => "$qid"	,'prop' => 'labelAlign'			,'value' => 'Auto'),
						  array('question_id' => "$qid"	,'prop' => 'name'				,'value' => $name),
						  array('question_id' => "$qid"	,'prop' => 'options'			,'value' => implode("|",$options)),
						  array('question_id' => "$qid"	,'prop' => 'order'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'qid'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'required'			,'value' => $required),
						  array('question_id' => "$qid"	,'prop' => 'special'			,'value' => 'None'),
						  array('question_id' => "$qid"	,'prop' => 'text'				,'value' => $text),
						  array('question_id' => "$qid"	,'prop' => 'type'				,'value' => 'control_dropdown'),
						  array('question_id' => "$qid"	,'prop' => 'width'				,'value' => '150'));
				break;		
			case "shortname":
				$question_properties = array(
						  array('question_id' => "$qid"	,'prop' => 'labelAlign'			,'value' => 'Auto'),
						  array('question_id' => "$qid"	,'prop' => 'middle'				,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'name'				,'value' => $name),
						  array('question_id' => "$qid"	,'prop' => 'order'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'prefix'				,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'qid'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'readonly'			,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'required'			,'value' => $required),
						  array('question_id' => "$qid"	,'prop' => 'sublabels'			,'value' => '{"prefix":"Prefix","first":"First","middle":"Middle Name","last":"Last","suffix":"Suffix"}'),
						  array('question_id' => "$qid"	,'prop' => 'suffix'				,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'text'				,'value' => $text),
						  array('question_id' => "$qid"	,'prop' => 'type'				,'value' => 'control_fullname'));
				break;
			case "address":
				$question_properties = array(
						  array('question_id' => "$qid"	,'prop' => 'labelAlign'			,'value' => 'Auto'),
						  array('question_id' => "$qid"	,'prop' => 'name'				,'value' => $name),
						  array('question_id' => "$qid"	,'prop' => 'order'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'qid'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'required'			,'value' => $required),
						  array('question_id' => "$qid"	,'prop' => 'subfields'			,'value' => 'st1|st2|city|state|zip|country'),
						  array('question_id' => "$qid"	,'prop' => 'sublabels'			,'value' => '{"cc_firstName":"First Name","cc_lastName":"Last Name","cc_number":"Credit Card Number","cc_ccv":"Security Code","cc_exp_month":"Expiration Month","cc_exp_year":"Expiration Year","addr_line1":"Street Address","addr_line2":"Street Address Line 2","city":"City","state":"State \\/ Province","postal":"Postal \\/ Zip Code","country":"Country"}'),
						  array('question_id' => "$qid"	,'prop' => 'text'				,'value' => $text),
						  array('question_id' => "$qid"	,'prop' => 'type'				,'value' => 'control_address'));	
				break;
			case "email":
				$question_properties = array(
						  array('question_id' => "$qid"	,'prop' => 'confirmation'		,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'confirmationHint'	,'value' => 'Confirm Email'),
						  array('question_id' => "$qid"	,'prop' => 'disallowFree'		,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'hint'				,'value' => 'ex: myname@example.com'),
						  array('question_id' => "$qid"	,'prop' => 'labelAlign'			,'value' => 'Auto'),
						  array('question_id' => "$qid"	,'prop' => 'name'				,'value' => $name),
						  array('question_id' => "$qid"	,'prop' => 'order'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'qid'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'readonly'			,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'required'			,'value' => $required),
						  array('question_id' => "$qid"	,'prop' => 'size'				,'value' => '30'),
						  array('question_id' => "$qid"	,'prop' => 'text'				,'value' => $text),
						  array('question_id' => "$qid"	,'prop' => 'type'				,'value' => 'control_email'),
						  array('question_id' => "$qid"	,'prop' => 'validation'			,'value' => 'Email'));
				break;
			case "phone":
				$question_properties = array(
						  array('question_id' => "$qid"	,'prop' => 'countryCode'		,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'inputMask'			,'value' => 'disable'),
						  array('question_id' => "$qid"	,'prop' => 'inputMaskValue'		,'value' => '(###) ###-####'),
						  array('question_id' => "$qid"	,'prop' => 'labelAlign'			,'value' => 'Auto'),
						  array('question_id' => "$qid"	,'prop' => 'name'				,'value' => $name),
						  array('question_id' => "$qid"	,'prop' => 'order'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'qid'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'readonly'			,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'required'			,'value' => $required),
						  array('question_id' => "$qid"	,'prop' => 'sublabels'			,'value' => '{"country":"Country Code","area":"Area Code","phone":"Phone Number","full":"Phone Number"}'),
						  array('question_id' => "$qid"	,'prop' => 'text'				,'value' => $text),
						  array('question_id' => "$qid"	,'prop' => 'type'				,'value' => 'control_phone'));	
				break;
			case "date":
				$question_properties = array(
						  array('question_id' => "$qid"	,'prop' => 'allowTime'			,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'autoCalendar'		,'value' => 'Yes'),
						  array('question_id' => "$qid"	,'prop' => 'defaultTime'		,'value' => 'Yes'),
						  array('question_id' => "$qid"	,'prop' => 'format'				,'value' => 'mmddyyyy'),
						  array('question_id' => "$qid"	,'prop' => 'labelAlign'			,'value' => 'Auto'),
						  array('question_id' => "$qid"	,'prop' => 'name'				,'value' => $name),
						  array('question_id' => "$qid"	,'prop' => 'onlyFuture'			,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'order'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'qid'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'required'			,'value' => $required),
						  array('question_id' => "$qid"	,'prop' => 'startWeekOn'		,'value' => 'Sunday'),
						  array('question_id' => "$qid"	,'prop' => 'step'				,'value' => '10'),
						  array('question_id' => "$qid"	,'prop' => 'sublabels'			,'value' => '{"day":"Day","month":"Month","year":"Year","last":"Last Name","hour":"Hour","minutes":"Minutes"}'),
						  array('question_id' => "$qid"	,'prop' => 'text'				,'value' => $text),
						  array('question_id' => "$qid"	,'prop' => 'timeFormat'			,'value' => 'AM/PM'),
						  array('question_id' => "$qid"	,'prop' => 'type'				,'value' => 'control_datetime'));
				break;
			case "time":
				$question_properties = array(
						  array('question_id' => "$qid"	,'prop' => 'defaultTime'		,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'labelAlign'			,'value' => 'Auto'),
						  array('question_id' => "$qid"	,'prop' => 'name'				,'value' => $name),
						  array('question_id' => "$qid"	,'prop' => 'order'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'qid'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'range'				,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'required'			,'value' => $required),
						  array('question_id' => "$qid"	,'prop' => 'step'				,'value' => '10'),
						  array('question_id' => "$qid"	,'prop' => 'sublabels'			,'value' => '{"hour":"Hour","minutes":"Minutes","hourRange":"Hour","minutesRange":"Minutes"}'),
						  array('question_id' => "$qid"	,'prop' => 'text'				,'value' => $text),
						  array('question_id' => "$qid"	,'prop' => 'timeDiff'			,'value' => 'No'),
						  array('question_id' => "$qid"	,'prop' => 'timeFormat'			,'value' => 'AM/PM'),
						  array('question_id' => "$qid"	,'prop' => 'type'				,'value' => 'control_time'));
				break;
			case "likert":
				$mcolumns = array(); //choices
				foreach($wufooQuestionStructure["Choices"] as $sf){
					$mcolumns[]=$sf["Label"];
				}
				$mrows = array(); //statements
				foreach($wufooQuestionStructure["SubFields"] as $sf){
					$mrows[]=$sf["Label"];
				}
				$question_properties = array(
						  array('question_id' => "$qid"	,'prop' => 'dropdown'			,'value' => 'Yes|No'),
						  array('question_id' => "$qid"	,'prop' => 'inputType'			,'value' => 'Radio Button'),
						  array('question_id' => "$qid"	,'prop' => 'labelAlign'			,'value' => 'Top'),
						  array('question_id' => "$qid"	,'prop' => 'mcolumns'			,'value' => implode("|",$mcolumns)),
						  array('question_id' => "$qid"	,'prop' => 'mrows'				,'value' => implode("|",$mrows)),
						  array('question_id' => "$qid"	,'prop' => 'name'				,'value' => $name),
						  array('question_id' => "$qid"	,'prop' => 'order'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'qid'				,'value' => $qid),
						  array('question_id' => "$qid"	,'prop' => 'required'			,'value' => $required),
						  array('question_id' => "$qid"	,'prop' => 'text'				,'value' => $text),
						  array('question_id' => "$qid"	,'prop' => 'type'				,'value' => 'control_matrix'));
				break;
			
		}
		return $question_properties;
	}

	private function getSubmitButtonProps($qid,$text="Submit"){
		return  array(
						  array('question_id' => '$qid','prop' => 'buttonAlign'			,'value' => 'Auto'),
						  array('question_id' => '$qid','prop' => 'buttonStyle'			,'value' => 'None'),
						  array('question_id' => '$qid','prop' => 'clear'				,'value' => 'No'),
						  array('question_id' => '$qid','prop' => 'name'				,'value' => 'submit'),
						  array('question_id' => '$qid','prop' => 'order'				,'value' => $qid),
						  array('question_id' => '$qid','prop' => 'print'				,'value' => 'No'),
						  array('question_id' => '$qid','prop' => 'qid'					,'value' => $qid),
						  array('question_id' => '$qid','prop' => 'text'				,'value' => $text),
						  array('question_id' => '$qid','prop' => 'type'				,'value' => 'control_button')
						);
				
	}
	/*
		Trims non
	*/
	private function getNameFromText($name){
		return $name;
	}
}

?>