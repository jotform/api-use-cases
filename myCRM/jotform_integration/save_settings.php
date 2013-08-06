<?php
//simple php ajax responder for myCRM settings save
$handle = mysql_connect('localhost', "io4crm_main","243243");
mysql_select_db("io4crm_main",$handle);

$matches = mysql_real_escape_string($_POST["matches"],$handle);
$formId = mysql_real_escape_string($_POST["formId"],$handle);
$username = mysql_real_escape_string($_POST["username"],$handle);
$jot_username = mysql_real_escape_string($_POST["jotUsername"],$handle);





$query = "insert into settings (username,formId,jot_username,matches) values (
			'$username',
			'$formId',
			'$jot_username',
			'$matches'
	)";

$result = mysql_query($query,$handle);
$output = "OK"; //hope no error occures here!!!

mysql_close($handle);
echo $output;//send username or NOTOK to client

?>