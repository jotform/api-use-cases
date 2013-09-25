<?
	$apiKey = $_GET['apiKey'];
	$formID = $_GET['formID'];
	$format = $_GET['format'];

	if( $formID < 1)
		die("Form ID Missing!");

	switch ($format) {
		case "PostgreSQL":
			include 'jotform_postgresqldump.php';
			$sql = jotform_postgresqldump($apiKey, $formID, $format);
			break;
		case "Oracle":
			include 'jotform_oracledump.php';
			$sql = jotform_oracledump($apiKey, $formID, $format);
			break;
		case "SQL Server":
			include 'jotform_sqlserverdump.php';
			$sql = jotform_sqlserverdump($apiKey, $formID, $format);
			break;
		default:
			include 'jotform_mysqldump.php';
			$sql = jotform_mysqldump($apiKey, $formID, $format);
			break;
	}


	chdir("zip/");
	$sqlFile = "$formID.sql";
	$zipFile = "sql$formID.zip";
	file_put_contents($sqlFile, $sql);

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