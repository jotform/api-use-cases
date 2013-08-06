<?php
	include "lib/init.php";
	//general php implements 3 operations login, logout, register
	
	$user = get_user(); //get user and authentication check

	$action = $_GET["action"];

	$method = $_SERVER["REQUEST_METHOD"];


	switch($action){
		case "list":
			contacts::listContacts();
			break;
		case "add":
			if($method === "GET"){
				contacts::displayAddContactForm();
			}elseif($method === "POST"){
				contacts::handleAddContact();
			}
			break;
		case "delete":
			$id = $_GET["id"];
				delete_contact($id);
				header("Location: /contacts.php?action=list");
			break;
		case "edit":
			$id = $_GET["id"];
				
			if($method === "GET"){
				contacts::displayEditContactForm($id);

			}elseif($method === "POST"){
				contacts::handleEditContact($id);
			}
			break;

		case "view":
			$id = $_GET["id"];
				contacts::viewContact($id);
				
			break;
	}


	class contacts{

		/*
			lists contacts of current user with action buttons
		*/
		public static function listContacts(){
			global $smarty,$user;

			$contacts = get_contact_list($user["id"]);

			$smarty->assign("contacts",$contacts);
			$smarty->display("contacts.list.tpl.html");
		}


		public static function displayAddContactForm($vars = array()){
			global $smarty;

			$vars = self::ext($vars,array("error"=>"false","formAction" => "/contacts.php?action=add","buttonText" => "Add Contact"));


			$smarty->assign($vars);
			$smarty->display("contacts.add.tpl.html");
		}

		public static function handleAddContact(){
			//login user or display loginForm with errors
			$first_name = $_POST["first_name"];
			$last_name = $_POST["last_name"];
			$location = $_POST["location"];
			$email = $_POST["email"];
			$comments = $_POST["comments"];

			if(!add_contact(
				array(
						"first_name" => $first_name,
						"last_name" => $last_name,
						"location" => $location,
						"email" => $email,
						"comments" => $comments
					)
			)){
				self::displayAddContactForm(array("error" => "Error inserting contact to list"));
			}else{
				//redirect to homepage on success
				header("Location: /contacts.php?action=list");
			}

		}
		public static function displayEditContactForm($id,$vars = array()){
			global $smarty,$db;

			$vars = self::ext($vars,array("error"=>"false","buttonText" => "Update Record","formAction" => "/contacts.php?action=edit&id=$id","oldValues" => $db->sql("select * from contacts where id = '".$db->escape($id)."'") ));


			$smarty->assign($vars);
			$smarty->display("contacts.add.tpl.html");
		}

		public static function handleEditContact($id){
			//login user or display loginForm with errors
			$first_name = $_POST["first_name"];
			$last_name = $_POST["last_name"];
			$location = $_POST["location"];
			$email = $_POST["email"];
			$comments = $_POST["comments"];

			if(!edit_contact(
				array(
						"first_name" => $first_name,
						"last_name" => $last_name,
						"location" => $location,
						"email" => $email,
						"comments" => $comments
					)
				,$id
			)){
				self::displayAddContactForm(array("error" => "Error inserting contact to list"));
			}else{
				//redirect to homepage on success
				header("Location: /contacts.php?action=list");
			}

		}

		public static function displayRegisterForm($vars = array()){
			global $smarty;

			$vars = self::ext($vars,array("error"=>"false","formAction" => "/general.php?action=register"));


			$smarty->assign($vars);
			$smarty->display("register.tpl.html");
		}

		public static function handleRegister(){
			//login user or display loginForm with errors
			$username = $_POST["username"];
			$password = $_POST["password"];
			$password2 = $_POST["password2"];

			if($password !== $password2){
				self::displayRegisterForm(array("error" => "Passwords does not match!"));
			}else{
				if(!register_user($username,$password)){
					self::displayRegisterForm(array("error" => "Username is already taken, please type another one!"));
				}else{
					//redirect to homepage on success
					header("Location: /general.php?action=registerOK");
				}
			}
		}

		public static function viewContact($id){

			global $smarty,$db;
			$content = "<table class='table'>";
			foreach($db->sql("select * from contacts where id = '".$db->escape($id)."'") as $key => $value){
				$content .= "
					<tr>
						<td> $key</td><td> $value</td>
					</tr>
				";
			}
			$content.="</table>";

			$smarty->assign("content",$content);
			$smarty->display("general_content.tpl.html");


		}

		public static function displayRegisterOKPage(){
			global $smarty;
			$smarty->display("registerOK.tpl.html");

		}

		/*
			extends source with target and returns result
		*/
		private function ext($target,$source){
			foreach($source as $key => $value){
				if(!array_key_exists($key, $target)){
					$target[$key] = $value;	
				}
			}
			return $target;
		}

	}



?>

