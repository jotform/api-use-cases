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
	}


	class general{


		public static function displayLoginForm($vars = array("error"=>"false","formAction" => "/general.php?action=login")){

			global $smarty;
			$smarty->assign($vars);
			$smarty->display("login.tpl.html");
		}

		public static function handleLogin(){
			//login user or display loginForm with errors
			
		}

	}



?>

