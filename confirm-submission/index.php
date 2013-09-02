<?php

    include 'JotForm.php';
    
    /**
     * Sample link is http://www.yourserver.com/confirm.php?id={id}
     * {id} tag will automatically be replaced by the real submission id when
     * the email notifications are fired.
     */
    
    function confirmSubmission() {
         // Your (full-access) JotForm API Key for this application
        $apiKey = '6a912a693094ac1696f65e93d89b3e3a'; 
        
        // Submission ID passed from the confirmation link
        $subID = $_GET['id']; 
        
        // Question ID for the field designated as the 'confirmed' flag
        $questionID = '3'; 
        
        // Value assigned to a verified submission
        $confirmValue = 'Yes'; 
        
        $jotformAPI = new JotForm($apiKey);
        $result = $jotformAPI->editSubmission($subID, array($questionID => $confirmValue ));
        
        if(!is_array($result)) {
            var_dump($result);
        }
        
    }
    
    confirmSubmission();
    
?>

<!DOCTYPE html>
<html>
    <head>
        <title>Verification</title>
    </head>
    <body>
        <center><h2>Thank you for verifying your email.</h2></center>
    </body>
</html>