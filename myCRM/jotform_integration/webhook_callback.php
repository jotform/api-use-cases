<?php

//fetch POST parameters
$formId = $_POST["formID"];
$submissionID = $_POST["submissionID"];
$rawRequest = $_POST["rawRequest"];

//unescape json encoded rawRequest string
$escapedRawRequest = unescapeJSON($rawRequest);

$req = json_decode($escapedRawRequest,true);

//fetch matches and username from formId inside settings table
//establish mysql connection
$handle = mysql_connect('localhost', "io4crm_main","243243");
mysql_select_db("io4crm_main",$handle);

$formId = mysql_real_escape_string($formId,$handle);
$result = mysql_query("select * from settings where formId = '$formId'",$handle);
if(mysql_num_rows($result) !== 0){
	//found an entry in settings table belonging to $formId
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

	foreach( $req as $key => $value){
		if(is_array($value) ){
			foreach($value as $sk => $sv){
				$search_key = explode("_",$key);
				$search_key = $search_key[0];
				$finded = searchFromMatches($matches,$search_key."_".$sk,"true");
				if($finded !== false){
					$insertValues[$finded->key] = $sv;	
				}
			}
			//handle subfields
		}else{
			echo "search started => $key \n";
			$finded = searchFromMatches($matches,$key,"false");
			if($finded !== false){
				$insertValues[$finded->key] = $value;	
			}
		}
	}
	//set userid
	$insertValues["user_id"] = $user_id;

	//now we have to insert $insertValues array
	$query = "insert into contacts";
	$keys = array();
	$values = array();

	foreach($insertValues as $key => $value){
		$keys[]=$key;
		$values[]=mysql_real_escape_string($value,$handle);
	}
	//build insert query
	$query = $query." (`".implode("`,`",$keys)."`) values ('".implode("','",$values)."')";
	mysql_query($query,$handle);
	//we are done, record inserted

}else{
	echo "no integration settings detected";
}


//helper functions
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
			return $match->target;
		}
	}
	return false;
}


?>