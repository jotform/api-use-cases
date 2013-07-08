<?php
    include "JotForm.php";
    getData($_POST);

    /*
    **Get all submission data from fields using Jotform API
    */
    function getData($fields) {
        $apiKey = $fields['api'];
        $jotform = new JotForm($apiKey);
        $form = "";
        $output = array();
        $columns = array();
        $includeForm = array_key_exists('includeForm', $fields);
        if($includeForm) {
            array_push($columns, 'Form Name');
        }
        foreach($fields as $field=>$on) {
            if(strpos($field, '_') === false) continue;
            $question = explode('_', $field);
            if($question[0] != $form) {
                $submissions = $jotform->getFormSubmissions($question[0]);
                $form = $question[0];
                if($includeForm) {
                    $formInfo = $jotform->getForm($form);
                    $formName = $formInfo['title'];
                }
            }
            foreach($submissions as $key => $submission) {
                $submission_id = $submission['id'];
                if(array_key_exists('answers', $submission)) {
                    foreach($submission['answers'] as $key => $answer) {
                        if(array_key_exists('text', $answer) && array_key_exists('answer', $answer)) {
                            $fieldTitle = $answer['text'];
                            $strippedTitle = preg_replace('/\s+/', '', $fieldTitle);
                            if($strippedTitle == $question[2]) {
                                $columnTitle = ($fields['groupby'] == 'name')?$fieldTitle:preg_replace('/control_/', '', $answer['type']);
                                if(!in_array($columnTitle, $columns)) {
                                    array_push($columns, $columnTitle);
                                }
                                if(!array_key_exists($submission_id, $output)) {
                                    $output[$submission_id] = array();
                                    if($includeForm) {
                                        $output[$submission_id]['Form Name'] = $formName;
                                    }
                                }
                                $text = (is_array($answer['answer']))? implode(' - ', $answer['answer']): $answer['answer'];
                                if(array_key_exists($columnTitle, $output[$submission_id])) {
                                    $output[$submission_id][$columnTitle] = $output[$submission_id][$columnTitle] . ' - ' . $text;
                                } else {
                                    $output[$submission_id][$columnTitle] = $text;
                                }
                            }
                        }
                    }
                }
            }
        }
        createFile($output, $columns, $apiKey);
    }

    /*
    *Create CSV file and allow download
    */
    function createFile($data, $columns, $apiKey) {
        $jotform = new JotForm($apiKey);
        $userInfo = $jotform->getUser();
        $filename = $userInfo['username'] . '_' . rand();
        $fp = fopen('CSVs/' . $filename . '.csv', 'w');
        fputcsv($fp, $columns);
        $count = 0;
        $limit = 2000;
        $limited = false;
        foreach($data as $submission_id => $submission) {
            if(++$count > $limit) {
                $limited = true;
                break;
            };            
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
        $warning = $limited? "CSV file limited to "+$limit+" lines":false;
        $data = array('warning' => $warning, 'filename' => $filename);
        echo json_encode($data);
    }
?>
