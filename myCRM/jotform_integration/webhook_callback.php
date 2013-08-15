<?php
ini_set("display_errors",true);
error_reporting(E_ALL);


ob_start();
echo "Hi I am webhook URL \n";
echo "**************\n";

$formId = $_POST["formID"];
$submissionID = $_POST["submissionID"];
$rawRequest = $_POST["rawRequest"];
echo "received raw request => $rawRequest \n";
$escapedRawRequest = unescapeJSON($rawRequest);
echo "escaped raw request => $escapedRawRequest \n";

$req = json_decode($escapedRawRequest,true);
//fetch matches and username from formId inside settings table

//establish mysql connection
//simple php ajax responder for myCRM settings save
$handle = mysql_connect('localhost', "io4crm_main","243243");
mysql_select_db("io4crm_main",$handle);

$formId = mysql_real_escape_string($formId,$handle);
$result = mysql_query("select * from settings where formId = '$formId'",$handle);
if(mysql_num_rows($result) !== 0){
	$fetch = mysql_fetch_assoc($result);
	$matches = str_replace('\\"', '"', $fetch["matches"]);

	$matches = json_decode($matches);
	$insertValues = array(); //lets populate insert values using matches and rawRequest
	$username = $fetch["username"];
	//find userid
	$sq = "select id from user where username = '".mysql_real_escape_string($username,$handle)."'";
	$sr = mysql_query($sq,$handle);
	$sf = mysql_fetch_assoc($sr);
	$user_id = $sf["id"];
	var_dump($matches);
	sl("small matches log ".print_r($matches,true));
	foreach( $req as $key => $value){

		if(is_array($value) ){
			
			foreach($value as $sk => $sv){
				sl("6.2");
				$search_key = explode("_",$key);
				$search_key = $search_key[0];
				echo "search started => $search_key   _   $sk \n";
				sl("6.3");
				$finded = searchFromMatches($matches,$search_key."_".$sk,"true");
				var_dump($finded);
				sl("6.4a");
				if($finded !== false){
					sl("6.5");
					$insertValues[$finded->key] = $sv;	
				}
				sl("6.51");
			}
			//handle subfields
		}else{
			echo "search started => $key \n";
			$finded = searchFromMatches($matches,$key,"false");
			var_dump($finded);
			sl("6.6");
			if($finded !== false){
				$insertValues[$finded->key] = $value;	
			}
		}
		sl("6.7");	
	}
	//set userid
	$insertValues["user_id"] = $user_id;
	sl("6.8");
	//now we have to insert $insertValues array
	$query = "insert into contacts";
	$keys = array();
	$values = array();

	foreach($insertValues as $key => $value){
		$keys[]=$key;
		sl("6.81");
		$values[]=mysql_real_escape_string($value,$handle);
	}
	sl("6.9");
	$query = $query." (`".implode("`,`",$keys)."`) values ('".implode("','",$values)."')";
	echo $query;
	mysql_query($query,$handle);
	//we are done, record inserted

}else{
	echo "no integration settings detected";
}




$conts = ob_get_contents();
ob_end_flush();

$logFile = "log.txt";

file_put_contents($logFile, "\n\n\n\n".$conts,FILE_APPEND | LOCK_EX);

function unescapeJSON($str){
	return str_replace("\\'","'" ,str_replace('\\"', '"', $str));
}

function searchFromMatches($matches,$key,$sss){
	if($sss === "false"){
		$key = explode("_", $key);	
	}else{
		$key = array($key);
	}
	$key = str_replace("q", "", $key[0]);
	foreach($matches as $match){
		if($match->question->key == $key){
			sl("will return found question => ".print_r($match->question,true));
			return $match->target;
		}
	}
	sl("sfm returning false");
	return false;
}

function sl($msg){
	file_put_contents("log.txt", "\n small log => ".$msg."\n",FILE_APPEND | LOCK_EX);
}

?>