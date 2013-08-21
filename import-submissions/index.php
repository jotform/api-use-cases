<?php
    $error = '';
    if (isset($_POST['import'])) {
        include_once('import.php');
    }
?>
<!DOCTYPE html>
<HTML>
<HEAD>
    <TITLE>Import Submission Data</TITLE>
    <script src="//ajax.googleapis.com/ajax/libs/prototype/1.7.1.0/prototype.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <script src="http://js.jotform.com/JotForm.js"></script>
    <script src="js/importSubmissions.js"></script>
    <script src="js/bootstrap-fileupload.js"></script>
    <link href="css/bootstrap.css" type="text/css" rel="stylesheet" /> 
    <link href="css/bootstrap-fileupload.min.css" type="text/css" rel="stylesheet" /> 
    <link href="css/bootstrap-responsive.css" type="text/css" rel="stylesheet" />
    <script src='http://js.jotform.com/FormPicker.js'></script>
</HEAD>
<BODY>


    <div class="container" style='padding-top: 10px;'>

        <div class="row">
            <div class="span12">
                <div class="hero-unit">
                    <h1>Import Submissions</h1>
                    <p>Import data from CSV and MS Excel files.</p>
                    <p><button class="btn btn-large btn-primary" id='chooseForm'>Choose Form</button></p>
                </div>
            </div>
        </div>


        <div id="info" style='padding: 0px 0px 0px 50px'>
            <?php 
                if(strlen($error) > 0) {
                    if($error == 'none') {
                        print "<h4>File Successfully Submitted</h4>";
                    } else {
                        print "<h4>Error: $error</h4>"; 
                    }
                }
            ?>
        </div>

        <div id="control" style='display:none; padding: 20px 50px;'>
            <FORM id='fileForm' action="http://www.jotform.com/import-submissions/index.php" method="post" enctype="multipart/form-data">
                
                <h3 id='formName'></h3>
                <div id='template' style='display:none;'>
                    <br/>
                    Some of the fields have special formatting, like the address and time fields.  Ensure the file's format is identical to the template.
                    <br/><br/>
                    <b>.csv template</b><br/>
                    <textarea id='templateInput' style='width: 100%; height: 50px;'></textarea>
                    <br/>
                    If there is no data for a certain column leave it empty but remember the commas.
                    <br/><br/>
                    <b>.xls template</b><br/>
                    <TABLE id='xls' class='table table-striped'>
                        <THEAD id='xlsHead'></THEAD>
                        <TBODY id='xlsBody'></TBODY>
                    </TABLE>
                    <br/><br/>
                </div>

                <div class="fileupload fileupload-new" data-provides="fileupload">
                    <span class="btn btn-file">
                        <span class="fileupload-new">Select file</span>
                        <span class="fileupload-exists">Change</span>
                        <input type="file" name='file' id='file'/>
                    </span>
                    <span class="fileupload-preview"></span>
                    <a href="#" class="close fileupload-exists" data-dismiss="fileupload" style="float: none">x</a>
                </div>
                <div id='fileError' class='text-error' style='display:none'>Please Select a file.</div>
                <br/>
                <input type='hidden' id='APIkey' name='APIkey' />
                <input type='hidden' id='formID' name='formID' />
                <button id='importButton' type='submit' class='btn btn-success' name='import'>Import</button>
            </FORM>
        </div>
    </div>
</BODY>
</HTML>
