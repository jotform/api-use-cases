var CS = {

    /*
    **Make sure user is logged and then setup page
    */
    setup: function() {
        if(JF.getAPIKey()) {
            CS.getForms();
        } else {
            JF.login(
                function success(){
                    CS.getForms();
                },
                function error(){
                    alert("Could not authorize user");
                }
            );
        }
        this.setupGenerate();
    },


    /*
    **Grab all forms using API
    */
    getForms: function() {
        JF.getForms(function(forms){
            CS.displayForms(forms);
        });
    },


    /*
    **POST to php to create the csv file
    */
    setupGenerate: function() {
        Event.observe('userForms', 'submit', function(event) {
            $('submitButton').update('Generating....');
            $('submitButton').disabled = true;
            $('userForms').request({
                method: 'post',
                onFailure: function(error) {
                    console.log(error);
                },
                onSuccess: function(data) {
                    var json = data.responseText.evalJSON()
                    $('results').update();
                    if(json.warning) {
                        var warning = new Element('span').update(json.warning);
                        $('results').insert(warning);
                    }
                    $('results').insert("<a href='CSVs/"+json.filename+".csv'>"+json.filename+".csv file generated</a>");
                    $('submitButton').update('Generate CSV file');
                    $('submitButton').disabled = false;
                }
            });
            Event.stop(event);
        });
    },


    /*
    **Display all forms titles and set click listeners
    */
    displayForms: function(forms) {
        var formTitle;
        var formQuestions;
        for(var i=0; i<forms.length; i++){
            form = forms[i];
            formTitle = new Element('li', {id: 'title_' + form.id, class:'formTitle'}).update(form.title);
            $('formTitleList').insert(formTitle);
            formQuestions = new Element('div', {id: 'formQuestions_' + form.id, class:'formQuestions'}).hide();
            $('formQuestions').insert(formQuestions);
        }

        var clickTitle = function(el) {
            $$('.formTitle').invoke('removeClassName', 'selected');
            el.addClassName('selected');
            
            var formID = el.id.split('title_')[1];
            $$('.formQuestions').invoke('hide');
            $('formQuestions_' + formID).show();
            if(!el.hasClassName('created')) {
                CS.displayQuestions(formID);
                el.addClassName('created');
            }
        }
        $$('.formTitle').invoke('observe', 'click', function(e) {
            clickTitle(this);
        });

        clickTitle($$('.formTitle')[0]);
        
        $('api').setValue(JF.getAPIKey());
    },


    /*
    **Display questions for form when form title clicked
    */
    displayQuestions: function(formID) {
        JF.getFormQuestions(formID, function(questions){
            var output = "";
            for(var question in questions) {
                question = questions[question];
                var allowable = ['control_hidden','control_autocomp','control_textbox','control_email','control_number','control_autoincrement','control_textarea','control_dropdown',
                'control_checkbox','control_radio','control_datetime','control_time','control_fileupload','control_rating','control_slider','control_spinner','control_range','control_fullname',
                'control_grading','control_matrix','control_birthdate','control_phone','control_stripe','control_paymill','control_payment','control_paypal','control_paypalpro','control_clickbank',
                'control_2co','control_googleco','control_worldpay','control_onebip','control_authnet','control_dwolla','control_stripe','control_paymill','control_authnet','control_paypalpro','control_address']; 

                if(allowable.indexOf(question.type) > -1) {
                    var questionID = question.qid;
                    var questionType = question.type.split('control_')[1];
                    var questionName = question.text;
                    var strippedName = questionName.replace(/ /g,'');
                    var inputName = formID+"_"+questionID+"_"+strippedName;
                    output += "<input type='checkbox' name='"+inputName+"' />"+questionName + " (type: " + questionType +  ")<br/>";
                }
            }
            $('formQuestions_' + formID).update(output);
            $('userForms').show();
        });
    }
}
CS.setup();
