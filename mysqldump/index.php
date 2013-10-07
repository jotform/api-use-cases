<?
	//print $_SERVER['HTTP_HOST'];
	// $FORMAT = "MySQL";  //default

	switch ($_SERVER['HTTP_HOST']) {
		case 'postgresql.jotform.io':
			$FORMAT = 'PostgreSQL';
			break;
		case 'oracle.jotform.io':
			$FORMAT = 'Oracle';
			break;
		case 'mariadb.jotform.io':
			$FORMAT = 'MariaDB';
			break;
		case 'sqlserver.jotform.io':
			$FORMAT = 'SQL Server';
			break;
		case 'db2.jotform.io':
			$FORMAT = 'DB2';
			break;
		case 'sqlite.jotform.io':
			$FORMAT = 'SQLite';
			break;
		case 'sybase.jotform.io':
			$FORMAT = 'Sybase';
			break;
		case 'hive.jotform.io':
			$FORMAT = 'Hive';
			break;
		case 'informix.jotform.io':
			$FORMAT = 'Informix';
			break;
		case 'sapsybaseiq.jotform.io':
			$FORMAT = 'SAP Sybase IQ';
			break;
		case 'drizzle.jotform.io':
			$FORMAT = 'Drizzle';
			break;
		case 'mongodb.jotform.io':
			$FORMAT = 'MongoDB';
			break;
		default:
			$FORMAT = 'MySQL';
			break;
	}
?>
<html>
	<head>
		<title><?=$FORMAT?> Export for JotForm</title>

		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

		<link href="//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css" rel="stylesheet">

		<link rel="Shortcut Icon" href="http://max.jotfor.ms/favicon.ico?123456&v=3.0.2405" />
		<!-- You can also include common-page-styles.css file into yourstyle.css, it is recommended -->
		<link rel="stylesheet" type="text/css" href="css/your-style.css?rev=1">

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
		</style>

	</head>

	<body>
		<div class="page-wrap">
		    <header id="header">
		        <div class="header">
		            <div class="header-content">
		                <a href="/" class="logo-link">
		                    <img src="http://cdn.jotfor.ms/common-img/jotformCleanLogo.png" alt="JotForm Developers" />
		                </a>
		            </div>
		        </div>
		    </header>

			<center style="padding-top: 90px;">
				<h1><?=$FORMAT?> Export for JotForm</h1>

				<font color="green" size=2>Get <?=$FORMAT?> output of your form submissions. Ready to be loaded on any 
					<? switch ($FORMAT) {
						case 'PostgreSQL':
							echo "phpPgAdmin";
							break;
						case 'Oracle':
							echo "Oracle DB";
							break;
						case 'SQL Server':
							echo "MS SQL Server";
							break;
						case 'SQLite':
							echo "SQLite Database";
							break;
						case 'Drizzle':
							echo 'Drizzle';
							break;
						case 'Sybase':
							echo 'Sybase';
							break;
						case 'SAP Sybase IQ':
							echo 'Sybase IQ';
							break;
						case 'Hive':
							echo 'Hive';
							break;
						case 'Informix':
							echo 'Informix';
							break;
						case 'DB2':
							echo 'DB2';
							break;
						case 'MongoDB':
							echo "MongoDB";
							break;
						default:
							echo "phpMyAdmin";
							break;
					} ?>
				</font>

				<br/><br/><br/>
				<h2>1. Connect JotForm<h2>
				<button id="authJotForm" class="big-button">Authenticate</button>
				<div id="authStatus" style="display:none;"><font color="green" size="3">Authenticated</font></div>

				<h2>2. Select a Form<h2>
				<button id="formpicker" class="big-button" style="display:none;">Select a Form</button>
				<div id="formpickerStatus" style="display:none;">
					<font color="green" size="3">
						Form Selected - <span id="formTitle">
					</font>
				</div>

				<h2>3. Rename Column Names<h2>
				<button id="renameColumns" class="big-button" style="display:none;">Rename Columns</button>
				<div id="renameColumns_result" style="display:none;">
					<font color="green" size="3">
						Column Names Renamed <span id="formTitle">
					</font>
				</div>

				<h2>4. Download SQL File<h2>
				<button id="download" class="big-button" style="display:none;">Download</button>
			</center>
		</div>


	<footer class="footer" id="footer">
	    <div class="tm">
	        <span>Powered by </span>
	        <span><a href="http://www.jotform.com">JotForm</a></span>
	        <span class="app-g"><a href="http://apps.jotform.com">JotForm Apps</a></span>
	    </div>
	</footer>

	<script type="text/javascript" src="http://developers.jotform.com/js/lib/jquery/jquery.min.js"></script>

	<script src='http://js.jotform.com/JotForm.min.js'></script>
	<script src='http://js.jotform.com/FormPicker.min.js'></script>
	<script src='http://js.jotform.com/QuestionNaming.min.js'></script>

	<script>
		var apiKey;
		var formID;
		var formTitle;
		var columnHeaders;

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
		            $("#renameColumns").css("display", "inline");
		            $("#download").css("display", "inline");
		        },
		        //onClose : function() {
		            // on close not working any more.
		            // moved it to onselect
		        //},
		    });
		});

		$("#renameColumns").click(function(e) {
			JF.QuestionNaming(formID, {
			    sort: 'order',
			    sortType: 'ASC',
			    title: 'Rename Column Names',
			    remember: true,
			    ignore_types: [
			        "control_head", 
			        "control_button", 
			        "control_pagebreak", 
			        "control_collapse", 
			        "control_text"
			    ],
			    unique: true,
			    unique_error_msg: "You cannot name fields with the same name.",
			    allowed_inputs: /^[a-z0-9_]+$/i,
			    inputs_error_msg: "Only Alphabetic and Numeric characters are allowed.",
			    onSubmit: function(response) {
			    	columnHeaders = JSON.stringify(response);
			    	$("#renameColumns_result").css("display", "inline");
			    },
			    modalCSS: '<stylesheet link>'
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

			if (columnHeaders) {
				xmlhttp.open("GET", "/get_mysqldump.php?formID="+formID+"&format=<?=$FORMAT?>&columnHeaders="+columnHeaders+"&apiKey="+apiKey, true);
			} else {
				xmlhttp.open("GET", "/get_mysqldump.php?formID="+formID+"&format=<?=$FORMAT?>&apiKey="+apiKey, true);
			}
			xmlhttp.send();
		}

	    // It will create a ZIP file and send its name back to browser 
	    // We will redirect user to that file

	</script> 

	<!-- Google Analytics Code -->
	<script type="text/javascript">

	      var _gaq = _gaq || [];
	      _gaq.push(['_setAccount', 'UA-1170872-7']);
	      _gaq.push(['_setDomainName', 'jotform.com']);
	      _gaq.push(['_setAllowLinker', true]);
	      _gaq.push(['_trackPageview']);

	      (function() {
	        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	        ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js';
	        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	      })();

	 </script>

	</body>
</html>