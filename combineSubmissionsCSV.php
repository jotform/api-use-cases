<?php
    /*
    *** Combine Submission Results from forms into one csv file:
    *** 1. Select the fields you would like in your file
    *** 2. Hit submit and a csv will be produced.  Any fields with the same name in multiple forms will be combined into one column
    */

    include "JotForm.php";

    /*
    **Display All Fields on Account
    */
    function displayAllFields() {
        $jotform = new JotForm("42b98942aa2c87268d781c86046304ba");
        $forms = $jotform->getForms();
        foreach($forms as $form) {
            printf("<h3>%s</h3>", $form['title']);
            $form_id = $form['id'];
            $questions = $jotform->getFormQuestions($form_id);
            foreach($questions as $question) {
                $question_id = $question['qid'];
                if($question['type'] != 'control_button') {
                    $strippedTitle = preg_replace('/\s+/', '', $question["text"]);
                    printf("<input type='checkbox' name=%s_%s_%s / > %s<br/>", $form_id, $question_id, $strippedTitle, $question["text"]);
                }
            }
        }
    }

    /*
    **Get all submission data from fields using Jotform API
    */
    function getData($fields) {
        $jotform = new JotForm("42b98942aa2c87268d781c86046304ba");
        $form = "";
        $output = array();
        $columns = array();
        foreach($fields as $field=>$on) {
            if(strpos($field, '_') === false) continue;
            $question = explode('_', $field);
            if($question[0] != $form) {
                $submissions = $jotform->getFormSubmissions($question[0]);
                $form = $question[0];
            }

            foreach($submissions as $key => $submission) {
                $submission_id = $submission['id'];
                foreach($submission['answers'] as $key => $answer) {
                    if(array_key_exists('text', $answer)) {
                        $fieldTitle = $answer['text'];
                        $strippedTitle = preg_replace('/\s+/', '', $fieldTitle);
                        if($strippedTitle == $question[2]) {
                            if(!in_array($fieldTitle, $columns)) {
                                array_push($columns, $fieldTitle);
                            }
                            if(!array_key_exists($submission_id, $output)) {
                                $output[$submission_id] = array();
                            }
                            $text = (is_array($answer['answer']))? implode(' - ', $answer['answer']): $answer['answer'];
                            $output[$submission_id][$answer['text']] = $text;
                        }
                    }
                }
            }
        }
        createFile($output, $columns);
    }


    /*
    *Create CSV file and allow download
    */
    function createFile($data, $columns) {
        $filename = rand();
        $fp = fopen('CSVs/' . $filename . '.csv', 'w');
        fputcsv($fp, $columns);
        foreach($data as $submission_id => $submission) {
            $outputLine = array();
            foreach($columns as $title) {
                if(array_key_exists($title, $submission)) {
                    array_push($outputLine, $submission[$title]);
                } else {
                    array_push($outputLine, '');
                }
            }
            fputcsv($fp, $outputLine);
        }
        fclose($fp);
        printf("<a href='CSVs/%s.csv'>CSV file</a>", $filename);
    }
?>


<!DOCTYPE html>
<HTML>
<HEAD>
    <TITLE>Combine Submission data</TITLE>
</HEAD>
<BODY>
    <?if (isset($_POST['submit'])) {
        getData($_POST);
    }else{?>
        <FORM method="post">
            <? displayAllFields(); ?>
            <br/>
            <button name='submit' type="submit">Create CSV file</button>
        </FORM>
    <?}?>
</BODY>
</HTML>
