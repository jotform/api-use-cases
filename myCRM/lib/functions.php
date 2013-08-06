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

/*
	returns username and id of currently logged-in user also makes an authenticaton check if not logged in then
	redirects to general.php?action=login

*/
function get_user(){
	if(isLoggedIn()){
		return array(
			"username" => $_SESSION["username"],
			"id" => $_SESSION["userid"]
		);
	}else{
		header("Location: /general.php?action=login");
		exit(); //redirect user and cease execution
	}
}

/*
	returns contact list for given user id
*/
function get_contact_list($id){
	global $db;

	$sql = "select * from contacts where user_id = '".$db->escape($id)."'";
	$return = $db->sql($sql);
	if($db->records == 1){
		$return = array($return);
	}
	return $return;
}

function delete_contact($id){
	global $db;
	$sql = "delete from contacts where id = '".$db->escape($id)."'";
	$db->sql($sql);
}

function isLoggedIn(){
	if( array_key_exists("loggedin", $_SESSION) ) {
		if($_SESSION["loggedin"] === true){
			return true;
		}
	}
	return false;
}

/*
	tries to login user with given credentials, return true or false
	if login success, sets the correct session parameters(stores username and loggedin = true)
	
*/
function login_user($username,$password){
	global $db;

	$res = $db->sql("select * from user where username = '".$db->escape($username)."'");

	if($db->records == 0){
		return false;
	}
	
	$passdb = $res["password"];

	if(sha1($password) !== $passdb){
		return false;
	}
	//login success
	$_SESSION["username"] = $res["username"];
	$_SESSION["loggedin"] = true;
	$_SESSION["userid"] = $res["id"];
	return true;

}
/*
	registers given username and password,
	if check uniqueness of username
*/
function register_user($username,$password){
	global $db;

	$res = $db->sql("select * from user where username = '".$db->escape($username)."'");

	if($db->records != 0){ //uniqueness check
		return false;
	}

	//register here
	$sql = "insert into user (username,password) values ('".$db->escape($username)."','".$db->escape(sha1($password))."')";
	$db->sql($sql);
	return true;

}

/*
	adds contact using given params
*/
function add_contact($params){
	global $db;
	if(!array_key_exists("user_id", $params)){
		$user = get_user();
		$params["user_id"] = $user["id"];
	}
	return $db->Insert($params,"contacts");
}

function edit_contact($params,$id){
	global $db;
	
	return $db->Update("contacts",$params,array("id"=>$id));
}

function assignDefaultSmartyVars(){
	global $smarty;
	//assign menu els

	if(isLoggedIn()){

		$menuEls = array(
			array(
				"text"=>"Add Contact",
				"url"=>"/contacts.php?action=add"
			),
			array(
				"text"=>"My Contacts",
				"url"=>"/contacts.php?action=list"
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