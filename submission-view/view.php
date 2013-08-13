<?php
$submission_id = isset($_POST['id'])? $_POST['id'] : $_GET['id'];
$username = isset($_POST['username'])? $_POST['username'] : $_GET['username'];
$form_title = isset($_POST['form_title'])?$_POST['form_title']:'';

//check requesst variables
if(!isset($submission_id) || !isset($username))
{
   echo "No Submission ID or Username is provided";
   return;
}

$link = mysql_connect('localhost:3036', 'io4views_php', '123jotrep')
    or die('Could not connect: ' . mysql_error());

mysql_select_db('io4views_db') or die('Could not select database');

// Performing SQL query to fetch USER and APIKEY
$query = "SELECT apiKey FROM `users` WHERE `username`='".mysql_real_escape_string($username)."';";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());
$result = mysql_fetch_array($result);        
$apiKey = $result['apiKey'];

if(!isset($apiKey))
{
   echo "User is not registered to Jotform Views APP!";
   return;
}

//get submission fields
$curl = curl_init();
curl_setopt_array($curl, array(
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_URL => "http://api.jotform.com/submission/" . $submission_id . "?apiKey=" . $apiKey
));
$result = curl_exec($curl);

$data = json_decode($result);
$submission = $data->content;
         
$FormID = $submission->form_id;

//Check if submission exists
if(!isset($FormID))
{
   echo "No Submission found for that ID";
   return;
}

// Performing SQL query
$query = "SELECT View FROM `views` WHERE `FormID`=".mysql_real_escape_string($FormID);
$result = mysql_query($query) or die('Query failed: ' . mysql_error());
$html = mysql_fetch_array($result);        
$template = $html['View'];
                                
require_once('smarty/libs/Smarty.class.php');
$smarty = new Smarty();
$smarty->assign('form_title',$form_title);
$smarty->assign('id',$submission_id);
$smarty->assign('form_id',$submission->form_id);

foreach ($submission->answers as $qid => $answer)
{
	if($answer && property_exists($answer,'text'))
	{
	$field = strtolower(str_replace('-','_',str_replace(' ','_', $answer->text)));
	//echo $field;
	if(empty($answer->answer)) $answer->answer = '';
	switch($answer->type)
	{
                case 'control_scale':
                case 'control_range':
                case 'control_matrix':
                case 'control_grading':
                case 'control_checkbox':
                case 'control_datetime':
                case 'control_address':
		case 'control_fullname':
 //--- payment
                case "control_paypal":
                case "control_payment":
                case 'control_stripe':
                case 'control_paypal':
                case 'control_paypalpro':
                case 'control_clickbank':
                case 'control_2co':
                case 'control_worldpay':
                case 'control_googleco':
                case 'control_onebip':
                case 'control_authnet':

		case 'control_phone':
			$smarty->assign($field,$answer->prettyFormat);
			break;
                case 'control_signature':
                        $value = "<img src='" . $answer->answer . "' alt='' style='width:100%;'/>";
			$smarty->assign($field,$value);	
			break;
		case 'control_fileupload':
			$value = "<img src='" . $answer->answer[0] . "' alt='' style='width:100%;'/>";
			$smarty->assign($field,$value);	
			break;
		// case 'control_rating':
		// 	break;
		default:
			$smarty->assign($field,$answer->answer);
	}
	}
	
}

$smarty->display("eval:base64:".$template);
?>