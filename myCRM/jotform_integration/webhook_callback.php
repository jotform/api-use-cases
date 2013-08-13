<?php
ini_set("display_errors",true);
error_reporting(E_ALL);

ob_start();
echo "Hi I am webhook URL \n";
echo "**************\n";
print_r($_POST);


$formId = $_POST["formID"];
$submissionID = $_POST["submissionID"];

$rawRequest = json_decode(json_decode('"'.$_POST["rawRequest"].'"'));

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

	$username = $fetch["username"];

	echo "received rawRequest => \n";
	print_r($rawRequest);
	echo "\n\n received fetch from table \n";
	echo "\n $matches \n";
	var_dump(json_decode($matches));

}else{
	echo "no integration settings detected";
}




$conts = ob_get_contents();
ob_end_clean();

$logFile = "log.txt";

$oldData = file_get_contents($logFile);
file_put_contents($logFile, $oldData."\n\n\n\n".$conts);

?>