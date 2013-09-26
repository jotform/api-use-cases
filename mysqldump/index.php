<?
	//print $_SERVER['HTTP_HOST'];
	$FORMAT = "MySQL";  //default

	if( $_SERVER['HTTP_HOST'] == "postgresql.jotform.io" ){
		$FORMAT = "PostgreSQL";
	} else if( $_SERVER['HTTP_HOST'] == "oracle.jotform.io" ){
		$FORMAT = "Oracle";
	} else if( $_SERVER['HTTP_HOST'] == "mariadb.jotform.io" ){
		$FORMAT = "MariaDB";
	} else if( $_SERVER['HTTP_HOST'] == "sqlserver.jotform.io" ){
		$FORMAT = "SQL Server";
	}

?><html>
<head>
	<title><?=$FORMAT?> Export for JotForm</title>
	<link href="//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css" rel="stylesheet">
	<style>
	.big-button{
		border-radius: 5px 5px 5px 5px;
		border: 1px solid rgb(19, 144, 69);
		background-color: rgb(19, 144, 69);
		color: white;
		font-size: 14px;
		text-align: center;
		cursor: pointer;
		height: 30px;
		min-width: 100px;
		line-height: 25px;
		transition: all 0.1s linear 0s;
	}
	html, body {
	    height: 100%;
	}

	html {
	    display: table;
	    margin: auto;
	}
	body {
		max-width:600px;
	    display: table-cell;
	    vertical-align: middle;
    }
	</style>
</head>

<body >

<center>
<h1><?=$FORMAT?> Export for JotForm</h1>
<font color="green" size=2>Get <?=$FORMAT?> output of your form submissions. Ready to be loaded on any phpMyAdmin.</font>
</center>

<br/><br/><br/>
<h2>1. Connect JotForm<h2>
<button id="authJotForm" class="big-button left">Authenticate</button>
<div id="authStatus" style="display:none;"><font color="green" size="3">Authenticated</font></div>

<h2>2. Select a Form<h2>
<button id="formpicker" class="big-button left" style="display:none;">Select a Form</button>
<div id="formpickerStatus" style="display:none;"><font color="green" size="3">
	Form Selected - <span id="formTitle"></div>
</font></div>


<h2>3. Download <?=$FORMAT?> File<h2>
<button id="download" class="big-button left" style="display:none;">Download</button>



<script type="text/javascript" src="http://developers.jotform.com/js/lib/jquery/jquery.min.js"></script>

<script src='http://js.jotform.com/JotForm.min.js'></script>
<script src='http://js.jotform.com/FormPicker.min.js'></script>
<script>
	var apiKey;
	var formID;
	var formTitle;

	$("#authJotForm").click(function(e) {
        JF.login(
            function success() {
                apiKey = JF.getAPIKey();
			    $("#authStatus").css("display", "inline");
			    $("#authJotForm").css("display", "none");
			    $("#formpicker").css("display", "inline");
            },
            function error() {
                $("#loginresults").html("error during authorization");
            }
        );
	});

    // Get API Key
    // Get Selected Form

	$("#formpicker").click(function(e) {
	    JF.FormPicker({
	        multiSelect: false,
	        onSelect: function(r) {
	            formID = r[0].id;
	            formTitle = r[0].title;
	            $("#formTitle").text(formTitle);
			    $("#formpickerStatus").css("display", "inline");
	            $("#formpicker").text("Change Form");
	            $("#download").css("display", "inline");
	        },
	        //onClose : function() {
	            // on close not working any more.
	            // moved it to onselect
	        //},
	    });
	});

	$("#download").click(function(e) {
		getMysqldump();
	});


    // Send them to the server (to PHP)
    function getMysqldump(){
    	// call server
    	//formID = getSelectedForm();
    	if( !formID )
    		return;
    	//alert("Form ID: "+formID+ " API KEY: " + apiKey);
    	getDumpURL( formID, apiKey );


    }

	function getDumpURL( formID, apiKey )
	{
		var xmlhttp;
		if (window.XMLHttpRequest)
		  {// code for IE7+, Firefox, Chrome, Opera, Safari
		  xmlhttp=new XMLHttpRequest();
		  }
		else
		  {// code for IE6, IE5
		  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		  }
		xmlhttp.onreadystatechange=function()
		  {
		  if (xmlhttp.readyState==4 && xmlhttp.status==200)
		    {
		    	// returns the zip file URL
		     window.location = xmlhttp.responseText ;
		    }
		  }
		xmlhttp.open("GET", "/get_mysqldump.php?formID="+formID+"&format=<?=$FORMAT?>&apiKey="+apiKey, true);
		xmlhttp.send();
	}

    // It will create a ZIP file and send its name back to browser 
    // We will redirect user to that file

</script> 






</body>
</html>