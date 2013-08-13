<?php 

$html = $_POST['html'];
$html = base64_encode(stripslashes($html));
$formID = $_POST['formID'];
$apiKey = $_POST['apiKey'];

if(!isset($formID) || !isset($apiKey))
{
    echo "Bad Request: formID or api key is not set.";
    return;
}


// Connecting, selecting database
$link = mysql_connect('localhost:3036', 'io4views_php', '123jotrep')
    or die('Could not connect: ' . mysql_error());

mysql_select_db('io4views_db') or die('Could not select database');

$query = "SELECT apiKey FROM users WHERE apiKey='".mysql_real_escape_string($apiKey)."';";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());
$num_rows = mysql_num_rows($result);

if ($num_rows < 1) {
    echo "Api key is not valid";
    return;
}

// Performing SQL query
$query = "REPLACE INTO views (FormID,View) VALUES(".$formID.", '".mysql_real_escape_string($html)."')";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());
$data = array("value" => "success");
echo json_encode($data); 

?>