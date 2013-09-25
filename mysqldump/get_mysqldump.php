<?

	$apiKey = $_GET['apiKey'];
	$formID = $_GET['formID'];
	$format = $_GET['format'];

	include 'jotform_mysqldump.php';
	$sql = jotform_mysqldump( $apiKey, $formID, $format);
	if( $formID < 1)
		die("Form ID Missing!");
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