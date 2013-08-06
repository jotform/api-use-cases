<?php

echo "Hi I am webhook URL";

ob_start();
echo "###";
echo json_encode($_POST);
echo "###";
var_dump($_GET);
var_dump($_COOKIE);
$conts = ob_get_contents();
ob_end_clean();
$logFile = "log.txt";

$oldData = file_get_contents($logFile);
file_put_contents($logFile, $oldData."\n\n\n\n".$conts);

?>