<?php 
$file = 'templates.tpl';
// Get contents
$html = file_get_contents($file);
$data = array("value" => $html);
echo json_encode($data); 

?>