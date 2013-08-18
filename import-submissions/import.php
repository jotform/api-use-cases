<?php

	$error = handleUpload($_FILES, $_POST);

    /**
     * Handle and read uploaded file
     * @param array - fileArray from form
     * @param array - postArray from form
     */
	function handleUpload($_FILES, $_POST) {
		require_once "JotForm.php";

		$path = mktime().'_'.$_FILES['file']['name'];

	    $key = $_POST['APIkey'];
	    $form = $_POST['formID'];

		$jot = new JotForm($key);
		$error = "";

	    if(move_uploaded_file($_FILES['file']['tmp_name'],$path)) {
	    	$fileType = getFileType($path);
	    	$columns = array();
	    	if($fileType == 'csv') {
				if (($handle = fopen($path, "r")) !== FALSE) {
					if(($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
						foreach($data as $title) {
							array_push($columns, $title);
						}
					}
					$error = 'File must contain at least two rows - the first represents the field titles';
				    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
				    	$error = '';
				    	$result = $jot->createFormSubmissions($form, writeData($data, $columns));
			        }
				    fclose($handle);
				} else {
					$error = 'Could not open file';
				}
			} else {
				require_once 'Excel/reader.php';
				$excel = new Spreadsheet_Excel_Reader();
				$excel->read($path);
				if($excel->sheets[0]['numRows'] > 1) {
					for ($i = 1; $i <= $excel->sheets[0]['numCols']; $i++) {
						$title = $excel->sheets[0]['cells'][1][$i];
						array_push($columns, $title);
					}

					for ($i = 2; $i <= $excel->sheets[0]['numRows']; $i++) {
						$data = array();
						for ($j = 1; $j <= $excel->sheets[0]['numCols']; $j++) {
							array_push($data, $excel->sheets[0]['cells'][$i][$j]); 
						}
						$jot->createFormSubmissions($form, writeData($data, $columns));
					}
				} else {
					$error =  'File must contain at least two rows - the first represents the field titles';
				}
			}
	    } else {
	    	$error = 'No File Found';
	    }
	    if(strlen($error) > 0) {
	    	return $error;
		} else {
			return 'none';
		}

    }

    /**
     * Decide uploaded file type
     * @param string - path to uploaded file
     * @return string - csv if plain text, tryExcel otherwise
     */
    function getFileType($path) {
    	$finfo = new finfo(FILEINFO_MIME);
    	$type = $finfo->file($path);
    	if(strpos($type, "text/plain") !== false) {
    		return 'csv';
    	} else {
    	 	return 'tryExcel';
    	}
    }

    /**
     * Format data for submission to JotForm
     * @param array - data for one submission
     * @param array - column names matchine data
     * @return string - csv if plain text, tryExcel otherwise
     */
    function writeData($data, $columns) {
		$num = count($data);
    	$submission = array();
    	for ($c=0; $c < $num; $c++) {
    		$column = explode('_', $columns[$c]);
			$qid = $column[0];
			$type = $column[count($column)-1];
			switch ($type) {
				case 'address':
					$address = $data[$c];
					$address = explode(',', $address);
					$submission["{$qid}_addr_line1"] = trim($address[0]);
					$submission["{$qid}_addr_line2"] = trim($address[1]);
					$submission["{$qid}_city"] = trim($address[2]);
					$submission["{$qid}_state"] = trim($address[3]);
					$submission["{$qid}_postal"] = trim($address[4]);
					$submission["{$qid}_country"] = trim($address[5]);
					break;

				case 'birthdate':
					$birthday = $data[$c];
					$birthday = explode('-', $birthday);
					$submission["{$qid}_year"] = trim($birthday[0]);
					$monthNames = array('January','February','March','April','May','June','July','August','September','October','November','December');
					$submission["{$qid}_month"] = trim($monthNames[ltrim($birthday[1], '0')]);
					$submission["{$qid}_day"] = trim(ltrim($birthday[2], 0));
					break;

				case 'datetime':
					$datetime = $data[$c];					
					$time = false;
					$date = $datetime;
					if (trim(strpos($datetime, " ")) && strlen($datetime) > 11) {
						$datetime = explode(' ', $datetime);
						$date = $datetime[0];
						$time = $datetime[1];
					}
					
					$date = explode('-', $date);
					$submission["{$qid}_year"] = trim($date[0]);
					$submission["{$qid}_month"] = trim($date[1]);
					$submission["{$qid}_day"] = trim($date[2]);
					if($time) {
						$time = explode(':', $time);
						$submission["{$qid}_hour"] = trim($time[0]);
						$submission["{$qid}_min"] = trim(substr($time[1], 0, 2));
						if(stripos($time[1], 'am')) {
							$submission["{$qid}_ampm"] = 'AM';
						} else if(stripos($time[1], 'pm')) {
							$submission["{$qid}_ampm"] = 'PM';
						}
					}

					break;

				case 'fullname':
					$fullname = $data[$c];
					$fullname = explode(',', $fullname);
					$submission["{$qid}_last"] = trim($fullname[0]);
					$submission["{$qid}_first"] = trim($fullname[1]);
					break;

				case 'phone':
					$phone = $data[$c];
					$phone = explode(',', $phone);
					$submission["{$qid}_area"] = trim($phone[0]);
					$submission["{$qid}_phone"] = trim($phone[1]);
					break;

				case 'time':
					$time = $data[$c];
					$range = false;
					if (strpos($time, "-")) {
						$range = explode('-', $time);
						$time = $range[0];
						$range = $range[1];
					}
					$time = explode(':', $time);
					$submission["{$qid}_hourSelect"] = ltrim($time[0], 0);
					$submission["{$qid}_minuteSelect"] = ltrim(substr($time[1], 0, 2), 0);
					if(stripos($time[1], 'am')) {
						$submission["{$qid}_ampm"] = 'AM';
					} else if(stripos($time[1], 'pm')) {
						$submission["{$qid}_ampm"] = 'PM';
					}
					if($range) {
						$range = explode(':', $range);
						$submission["{$qid}_hourSelectRange"] = ltrim($range[0], 0);
						$submission["{$qid}_minuteSelectRange"] = ltrim(substr($range[1], 0, 2), 0);
						if(stripos($range[1], 'am')) {
							$submission["{$qid}_ampmRange"] = 'AM';
						} else if(stripos($range[1], 'pm')) {
							$submission["{$qid}_ampmRange"] = 'PM';
						}
					}
					break;

				case 'checkbox':
				case 'grading':
					$checkbox = $data[$c];
					$checkbox = explode(',', $checkbox);
					for($i=0; $i<count($checkbox);$i++) {
						$submission["{$qid}_" . $i] = trim($checkbox[$i]);
					}
					break;

				case 'range':
					$range = explode('-', $data[$c]);
					$submission["{$qid}_from"] = $range[0];
					$submission["{$qid}_to"] = $range[1];
					break;

				case 'matrix':
					//ntw
					break;

				default:
					$submission[$qid] = $data[$c];
			}
    	}
    	return $submission;
	}


?>