<!DOCTYPE html>
<HTML>
<HEAD>
    <TITLE>Populate Fields</TITLE>
    <script src="//ajax.googleapis.com/ajax/libs/prototype/1.7.1.0/prototype.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <script src="http://js.jotform.com/JotForm.js"></script>
    <script src="js/populateFields.js"></script>
    <link rel="stylesheet" type="text/css" href="css/populateFields.css">
    <link href="css/bootstrap.css" type="text/css" rel="stylesheet" />  
    <link href="css/bootstrap-responsive.css" type="text/css" rel="stylesheet" />
    <script src='http://js.jotform.com/FormPicker.js'></script>
</HEAD>
<BODY>

    <div class="navbar navbar-inverse navbar-fixed-top">
        <div class="navbar-inner">
            <div class="container">

                <a class="brand">Populate Fields</a>
                
            </div>
        </div>
    </div>

    <div class="container" style='padding-top: 60px;'>
        <br/>
        <button class="btn btn-large btn-primary" id='chooseForm'>Choose Form</button>
        <br/><br/>
        <span id='loading' style='display:none'>loading...</span>
        <br/>
        <div id='form' style='margin-left: 5px;'></div>
        <br/><br/>
        <div id='populateURL'></div>
        <button id="generate" class="btn btn-large btn-success" style="display:none">generate populated url</button>
        <br/><br/>
    </div>
</BODY>
</HTML>
