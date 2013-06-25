<?php
/*
    Written for http://form.jotform.co/form/31755601191854
    
    Example Result : 
        $ In 10 submissions, there are 3 different answers for question #3 : %70 Yes, %20 No, %10 Not Answered

    1) Download JotFormAPI PHP Wrapper : https://github.com/jotform/jotform-api-php
    2) Set your apiKey at line 17 (Need one? http://www.jotform.com/myaccount/api)
    3) Set your formID and your question ID to get your answers' percentages

*/

include "JotForm.php";

function getSummary($formID, $questionID) {
    $jotform = new JotForm("yourAPIKey");

    $submissions = $jotform->getFormSubmissions($formID);

    foreach($submissions as $id => $submissionDetails) {
        $answer = isset($submissionDetails["answers"][$questionID]["answer"]) ? $submissionDetails["answers"][$questionID]["answer"] : "Not Answered";
        $answersArray[$answer] = isset($answersArray[$answer]) ? $answersArray[$answer] + 1 : 1;
    }

    $result = "";
    arsort($answersArray);

    foreach ($answersArray as $key => $value) {
        $percentages[$key] =  round(($answersArray[$key]*100) / count($submissions),1);
        $result .= "%${percentages[$key]} $key, ";
    }

    return sprintf("In %d submissions, there are %d different answers for question #%d : %s \n ",count($submissions),count($answersArray),$questionID,trim($result,' ,'));
}

print getSummary(yourFormID, yourQuestionID);