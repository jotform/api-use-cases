<?
	$apiKey = $_GET['apiKey'];
	$formID = $_GET['formID'];
	$format = $_GET['format'];
	$columnHeaders = $_GET['columnHeaders'];

	if( $formID < 1)
		die("Form ID Missing!");

	include 'form_details.php';

	$formTitle = getFormTitle($apiKey, $formID);
	$questions = getQuestions($apiKey, $formID, $columnHeaders);
	$submissions = getSubmissions($apiKey, $formID);

	switch ($format) {
		case 'PostgreSQL':
			include 'jotform_postgresqldump.php';
			$sql = jotform_postgresqldump($apiKey, $format, $formTitle, $questions, $submissions);
			break;
		case 'Oracle':
			include 'jotform_oracledump.php';
			$sql = jotform_oracledump($apiKey, $format, $formTitle, $questions, $submissions);
			break;
		case 'SQL Server':
			include 'jotform_sqlserverdump.php';
			$sql = jotform_sqlserverdump($apiKey, $format, $formTitle, $questions, $submissions);
			break;
		case 'DB2':
			include 'jotform_db2dump.php';
			$sql = jotform_db2dump($apiKey, $format, $formTitle, $questions, $submissions);
			break;
		case 'Sybase':
			include 'jotform_sybasedump.php';
			$sql = jotform_sybasedump($apiKey, $format, $formTitle, $questions, $submissions);
			break;
		case 'Hive':
			include 'jotform_hivedump.php';
			$sql = jotform_hivedump($apiKey, $format, $formTitle, $questions, $submissions);
			break;
		case 'Informix':
			include 'jotform_informixdump.php';
			$sql = jotform_informixdump($apiKey, $format, $formTitle, $questions, $submissions);
			break;
		case 'SAP Sybase IQ':
			include 'jotform_sybasedump.php';
			$sql = jotform_sybasedump($apiKey, $format, $formTitle, $questions, $submissions);
			break;
		case 'MongoDB':
			include 'jotform_mongodbdump.php';
			$sql = jotform_mongodbdump($apiKey, $format, $formTitle, $questions, $submissions);
			break;
		default:
			include 'jotform_mysqldump.php';
			$sql = jotform_mysqldump($apiKey, $format, $formTitle, $questions, $submissions);
			break;
	}

	chdir("zip/");

	if($format == "MongoDB") {
		$sqlFile = "$formID.json";
		file_put_contents($sqlFile, json_encode($sql));
	} else {
		$sqlFile = "$formID.sql";
		file_put_contents($sqlFile, $sql);
	}

	$zipFile = "sql$formID.zip";
    
    $zip = new ZipArchive();
    if ( $zip->open( $zipFile, ZipArchive::OVERWRITE) === false ){
        die("Cannot create zip archive.");
    }	
    $zip->addFile("$sqlFile");
    $zip->close();

    $url = "/zip/sql$formID.zip?t=".time();
    print $url;

	//print "<pre>$sql";
?>