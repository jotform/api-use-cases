<?php
	include "lib/init.php";
	//general php implements 3 operations login, logout, register
	


	$action = $_GET["action"];

	$method = $_SERVER["REQUEST_METHOD"];


	switch($action){
		case "login":

			if($method === "GET"){
				general::displayLoginForm();

			}elseif($method === "POST"){
				general::handleLogin();
			}

			break;
		case "register":
			if($method === "GET"){
				general::displayRegisterForm();

			}elseif($method === "POST"){
				general::handleRegister();
			}
			break;
		case "registerOK":
			general::displayRegisterOKPage();
			break;
		case "logout":
			general::logout();
			break;
	}


	class general{


		public static function displayLoginForm($vars = array()){
			global $smarty;

			$vars = self::ext($vars,array("error"=>"false","formAction" => "/general.php?action=login"));


			$smarty->assign($vars);
			$smarty->display("login.tpl.html");
		}

		public static function handleLogin(){
			//login user or display loginForm with errors
			$username = $_POST["username"];
			$password = $_POST["password"];

			if(!login_user($username,$password)){
				self::displayLoginForm(array("error" => "Wrong username/password combination please try again!"));
			}else{
				//redirect to homepage on success
				header("Location: /");
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

		public static function displayRegisterOKPage(){
			global $smarty;
			$smarty->display("registerOK.tpl.html");

		}

		public static function logout(){
			session_destroy();
			header("Location: /");
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

