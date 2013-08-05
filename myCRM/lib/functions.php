<?php
/*
	contains various static functions
*/

function getUserList(){
	global $db;

	$query = "select * from user";
	$result = $db->sql($query);
	if($result === false){
		return $db->lastError;
	}
	return $result;
}

function isLoggedIn(){
	return false;
}

function assignDefaultSmartyVars(){
	global $smarty;
	//assign menu els

	if(isLoggedIn()){

		$menuEls = array(
			array(
				"text"=>"Add Contact",
				"url"=>"add_contact.php"
			),
			array(
				"text"=>"My Contacts",
				"url"=>"list_contacts.php"
			),
			array(
				"text"=>"Log Out",
				"url"=>"general.php?action=logout"
			),
		);
	}else{
		$menuEls = array(
			array(
				"text"=>"Login",
				"url"=>"general.php?action=login"
			),
			array(
				"text"=>"Register",
				"url"=>"general.php?action=register"
			),
		);
	}

	$smarty->assign("menu",$menuEls);
}
?>