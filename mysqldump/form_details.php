<?
	include 'jotform-api-php/JotForm.php';

	function getFormTitle($apiKey, $formID) {
		$jotformAPI = new JotForm( $apiKey );

		$form = $jotformAPI->getForm( $formID );
		$formTitle = $form['title'];

		return $formTitle;
	}

	function getQuestions($apiKey, $formID, $columnHeaders) {
		$jotformAPI = new JotForm( $apiKey );

		$questions = $jotformAPI->getFormQuestions( $formID );

		if ($columnHeaders != null) {
			$questions = checkColumnHeaders($questions, $columnHeaders);
		}

		return $questions;
	}

	function getSubmissions($apiKey, $formID) {
		$jotformAPI = new JotForm( $apiKey );

		$submissions = $jotformAPI->getFormSubmissions( $formID, 0, 10000 );

		return $submissions;
	}

	function checkColumnHeaders($questions, $columnHeaders) {
		$columnsStr = json_decode(stripslashes($columnHeaders), TRUE);

		$newQuestions = array();

		foreach ($columnsStr as $c) {
			foreach ($questions as $q) {
				if ($q["qid"] == $c["qid"]) {
					$q["text"] = $c["modified_text"];
					$q["name"] = $c["modified_text"];

					array_push($newQuestions, $q);
				}
			}
		}

		return $newQuestions;
	}

?>