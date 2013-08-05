<?php
	include "lib/init.php";

	$smarty->assign("myvar","MYVAR");
	
	$smarty->display("index.tpl.html");
?>