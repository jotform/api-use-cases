<?
	include 'jotform-api-php/JotForm.php';

	function getFormTitle($apiKey, $formID) {
		$jotformAPI = new JotForm( $apiKey );

		$form = $jotformAPI->getForm( $formID );
		$formTitle = $form['title'];

		return $formTitle;
	}

	function getQuestions($apiKey, $formID) {
		$jotformAPI = new JotForm( $apiKey );

		$questions = $jotformAPI->getFormQuestions( $formID );

		return $questions;
	}

	function getSubmissions($apiKey, $formID) {
		$jotformAPI = new JotForm( $apiKey );

		$submissions = $jotformAPI->getFormSubmissions( $formID, 0, 10000 );

		return $submissions;
	}

?>