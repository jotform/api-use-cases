<?php

$formId = $_POST["formId"];
$username = $_POST["username"];
$apiKey = $_POST["apiKey"];
if(array_key_exists("requestUrl", $_POST)){
	$development = "'".$_POST["requestUrl"]."'";
}else{
	$development = "undefined"; //on live server this alway return false!!!
}


?>
<!DOCTYPE html>
<html>
<head>

<script type="text/javascript" src="/js/jquery.js"></script>
<script type="text/javascript" src="http://js.jotform.com/JotForm.js?REV=1008"></script>
<script type="text/javascript" src="http://js.jotform.com/JotFormIntegrate.js?REV=1008"></script>
<!-- INCLUDE JOTFORM Javascript Files-->


<script type="text/javascript">
	
	var formId = "<?=$formId?>";
	var username = "<?=$username?>";
	var apiKey = "<?=$apiKey?>";
	var myCRMUsername = false;
	var matches = false;
	var requestUrl = <?=$development?>;

	//our webhook callback url
	var webhookUrl = "http://crm.jotform.io/jotform_integration/webhook_callback.php"; 
	//start flow on load
	$(document).ready(function(){

		//Inialize JF Connect
		JF.connect({
			apiKey : apiKey,
			formId:  formId,
			requestUrl : requestUrl
		});

		step1();
	});

	/*
		displays page1 myCRM login window login user if correct go to step2
	*/
	function step1(){
		displayPage(1);
		$("#loginButton").click(function(){
			$.post("login.php",{
				username : $("#username").val(),
				password : $("#password").val()
			},function(response){
				if(response !== "NOTOK"){
					myCRMUsername = response;
					step2(); //go to step 2
				}else{
					$("#loginError").html("Wrong Username Password combination, please try again!");
				}
			});
		});
	}

	/*
		user now authenticated display fieldMatcher now!!!
	*/
	function step2(){
		displayPage(2);

		//display field matcher
		
		//boot fieldMatcher on given element
		JF.fieldMatch({
			el : document.getElementById("fieldMatcher"),
			targetFields : [
				{
					value: "First Name",
					key : "first_name",
					type:"control_textbox",
					autoMatch:true
				},
				{
					value: "Last Name",
					key  : "last_name",
					type :"control_textbox",
					autoMatch:true
				},
				{
					value: "Email",
					key : "email",
					type:"control_email",
					autoMatch:true
				},
				{
					value: "Address",
					key : "location",
					type:"control_adress",
					autoMatch:true
				},
				{
					value: "Comments",
					key : "comments",
					type:"control_textbox",
					autoMatch:true
				},
			],
			callback : function(m){
				//we have matches go step3
				matches = m;
				step3();
			}

		});
	}

	/*
		we haveboth authenticated user and matched form fields vs our contact fields

		now create a webhook using jotform.js and store this matches on db using ajax then complete workflow by calling JF.complete();
	*/
	function step3(){
		displayPage(3);
		console.log(matches);
		//TODO: use more resillient JSON library than native one
		
		//create webhook
		JF.createFormWebhook(formId,webhookUrl,function(){
					
		},function(){
			alert("error creating webhook");
		});

		//workaround wait for 2 seconds then save settings
		setTimeout(function(){
			$.post("save_settings.php",
				{
					matches:JSON.stringify(matches),
					username :myCRMUsername,
					jotUsername : username,
					formId : formId
				},function(resp){
						console.log(resp);
						//call complete to finish this
						JF.complete();
				});
		},2000);
	}


	/*
		general functions
	*/

	function displayPage(pid){
		$(".page").hide();
		$(".page"+pid).show();
	}

</script>
<style>

	.templates>div{
		display: none;
	}
	#loginError{
		color:red;font-weight: bold;
	}

</style>
</head>
<body>
<div class="templates">
	<!--myCRM authentication page -->
	<div class="page page1">
		Enter myCRM login credentials <br />
		Username : <input type="text" name="username" id="username"/> <br />
		Password : <input type="text" name="password" id="password"/> <br />
		<button id="loginButton">Login</button><br />
		<span id="loginError"></span>
	</div>
	<div class="page page2" id="fieldMatcher">
		
	</div>
	<div class="page page3">
		Now Storing your settings and creating webhook
	</div>
</div>

</body>
</html>