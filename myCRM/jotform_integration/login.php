<?php
//simple php ajax responder for myCRM login attemps
$handle = mysql_connect('localhost', "io4crm_main","243243");
mysql_select_db("io4crm_main",$handle);

$username = mysql_real_escape_string($_POST["username"],$handle);
$pass = sha1(mysql_real_escape_string($_POST["password"],$handle));

$query = "select * from user where username = '$username'";
$result = mysql_query($query,$handle);
$output = "";

if(mysql_num_rows($result) === 0){
	$output = "NOTOK"; //if a user has this username "NOTOK" this will be completely wrong but who cares! 
}else{
	//userexists

	$fetch = mysql_fetch_assoc($result);

	if($pass === $fetch["password"]){
		session_start();
		$_SESSION["loggedin"] = true;
		$_SESSION["username"] = $fetch["username"];
		$output = $fetch["username"];
	}else{
		$output = "NOTOK";
	}
	


}
mysql_close($handle);
echo $output;//send username or NOTOK to client

?>