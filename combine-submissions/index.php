<!DOCTYPE html>
<HTML>
<HEAD>
    <TITLE>Combine Submission data</TITLE>
    <script src="//ajax.googleapis.com/ajax/libs/prototype/1.7.1.0/prototype.js"></script>
    <script src="http://js.jotform.com/JotForm.js"></script>
    <link rel="stylesheet" type="text/css" href="css/combineSubmissions.css">
</HEAD>
<BODY>
    <div id='contents'>
        <div id='leftBar'>
            <ul id='formTitleList'>
            </ul>
        </div>

        <div id='main'>
            <FORM id="userForms" action="combineSubmissions.php" method="post" style='display:none'>
                <div id='csvOptions'>
                    Group Columns by:
                    <br/>
                    <input type="radio" name="groupby" value="type" checked>Question Type &nbsp<input type="radio" name="groupby" value="name" >Question Name
                    <br/><br/>
                    <input type="checkbox" name="includeForm" value="includeForm" checked>Include 'Form Name' column in csv file
                </div>
                <div id='formQuestions'>

                </div>
                <input type='hidden' id='api' name='api' value=''/>
                <br/>
                <button id='submitButton' name='submit' type="submit">Generate CSV file</button>
            </FORM>
            <br/>
            <div id="results">
            </div>
            <script src="js/combineSubmissions.js"></script>
        </div>
    </div>
</BODY>
</HTML>
