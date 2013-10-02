<?
	function jotform_mysqldump( $apiKey, $format, $formTitle, $questions, $submissions ){

		// get a list of questions  
		$new_questions = array();
		$ignored_fields = array("control_head", "control_button", "control_pagebreak", "control_collapse", "control_text");
		$i = 0;
		foreach( $questions as $q ){
			if ( !in_array( $q['type'], $ignored_fields ) && $q['text'] != "" && $q['text'] != "...."){
				array_push( $new_questions, $q);
				$ordered_questions[ $q['order'] ] = $i++;
			}
		}
		$questions = $new_questions;

		// CREATE TABLE STATEMENT 
		$table = mysql_fieldname_format($formTitle);

		$sql .= "CREATE TABLE IF NOT EXISTS `".$table."` (\n";
		
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

		$sql .= "\t`submissionID` BIGINT,\n";
		$sql .= implode(",\n", $fields_sql);
		$sql .= ",\n\tPRIMARY KEY (submissionID)";
		$sql .= "\n);\n\n";

		// INSERT / REPLACE STATEMENT 
		foreach( $submissions as $s ){

			$insert = "REPLACE `$table` (";
			$keys = array("`submissionID`");
			$values = array($s["id"]);	
			$answer = array();
			foreach( $s['answers'] as $a ){
				$answer[ $a['text'] ] = $a['answer'];
			}

			foreach ( $fields as $k){
				if( $k != "" && $k != "...."){
					array_push( $keys, "`".mysql_fieldname_format($k)."`");
					
					if( is_array( $answer[$k] ) ){
						$a = implode(",", $answer[$k]);
					}else{
						$a = $answer[$k];
					}
					array_push( $values, "'". my_mysql_real_escape_string( $a ) ."'");
				}
			}

			$insert .= implode( ", ", $keys );
			$insert .= ")\nVALUES (";
			$insert .= implode( ", ", $values );

			$insert .= ");\n\n";
			$sql .= $insert;
		}
		return $sql;
	}

	function mysql_fieldname_format($name){
		return preg_replace("/[^A-Za-z0-9_]/", "", $name);
	}

	// mysql_real_escape_string does not work on jotform.io
	function my_mysql_real_escape_string($str)
	{
	        $search=array("\\","\0","\n","\r","\x1a","'",'"');
	        $replace=array("\\\\","\\0","\\n","\\r","\Z","\'",'\"');
	        return str_replace($search,$replace,$str);
	}

	// TODO: 
	// - If there are more than one fields with same label, it will give a mysql duplicate field error.

?>