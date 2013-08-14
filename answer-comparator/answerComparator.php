<?php 	

	include "JotForm.php";

	$jot = new JotForm(<JotForm API KEY>);
	$submissions = $jot->getFormSubmissions(<FORM ID>);

	//Do not send email data to the front end - hash it first to prevent scraping
	foreach($submissions as $key => $submission) {
        $submission_id = $submission['id'];
		if(array_key_exists('answers', $submission)) {
            foreach($submission['answers'] as $answerKey => $answer) {
        		if(array_key_exists('type', $answer) && $answer['type'] == 'control_email' && array_key_exists('answer', $answer) && $answer['answer'] != '') {
        			$submissions[$key]['answers'][$answerKey]['answer'] = hash('md5', $answer['answer']);
        		}
        	}
        }
    }

	$encoded = json_encode($submissions);
	header('Content-type: application/json');
	exit($encoded);
?>