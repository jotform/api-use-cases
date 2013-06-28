<?


	include 'jotform-api-php/JotForm.php';

	function jotform_mysqldump( $apiKey, $formID ){

		// get a list of questions  
		$jotformAPI = new JotForm( $apiKey );

		$form = $jotformAPI->getForm( $formID );
		$formTitle = $form['title'];

		$questions = $jotformAPI->getFormQuestions( $formID );

		$new_questions = array();
		$ignored_fields = array("control_head", "control_button", "control_pagebreak", "control_collapse", "control_text");
		$i = 0;
		foreach( $questions as $q ){
			if ( !in_array( $q['type'], $ignored_fields ) ){
				array_push( $new_questions, $q);
				$ordered_questions[ $q['order'] ] = $i++;
			}
		}
		$questions = $new_questions;

		//print "<pre>";
		//print_r( $questions );

		// prepare CREATE TABLE code
		$table = mysql_fieldname_format($formTitle);
		$sql = "CREATE TABLE IF NOT EXISTS `".$table."` (\n";
		$fields_sql = array();
		$fields = array();
		foreach ( $ordered_questions as $order => $i ){
			$mysql_type = "varchar(255)";
			if( $questions[$i]['type'] == "control_textarea"){
				$mysql_type = "text";
			}
			array_push($fields, $questions[$i]['text']);
			array_push($fields_sql, "\t`".mysql_fieldname_format($questions[$i]['text'])."` ".$mysql_type);
		}
		$sql .= implode(",\n", $fields_sql);
		$sql .= "\n);\n\n";
		//print $sql;

		// get submission data 
		$submissions = $jotformAPI->getFormSubmissions( $formID );
		//print_r($submissions);



		foreach( $submissions as $s ){
			$insert = "INSERT IGNORE INTO  `$table` (\n";
			$keys = array();
			$values = array();	
			foreach ( $fields as $k){
				//print "<li>$k".$s['fields'][$k];
				array_push( $keys, "`".mysql_fieldname_format($k)."`");
				array_push( $values, "'". mysql_real_escape_string($s['fields'][$k]) ."'");
			}
			$insert .= implode( ", ", $keys );
			$insert .= "\n) VALUES (\n";
			$insert .= implode( ", ", $values );

			$insert .= "\n);\n\n";
			$sql .= $insert;
		}

		return $sql;

	}

	function mysql_fieldname_format($name){
		return preg_replace("/[^A-Za-z0-9_]/", "", $name);
	}


	// TODO: 
	// - If there are more than one fields with same label, it will give a mysql duplicate field error.


?>