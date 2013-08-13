<?php 
$user = $_POST['user'];
$apiKey = $_POST['apiKey'];

$user['apiKey'] = $apiKey;

echo json_encode($user);
?>