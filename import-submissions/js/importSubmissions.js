$.noConflict();

document.observe('dom:loaded', function() {
	IS.authorise();
}); 

IS = {

	formID: -1,

	//ntw - to develop: control_matrix
	allowable: ['control_autocomp','control_textbox','control_email','control_number','control_textarea','control_dropdown',
                'control_checkbox','control_radio','control_datetime','control_time','control_rating','control_slider','control_spinner',
                'control_range','control_fullname','control_grading','control_birthdate','control_phone','control_address'],

    /*
    ** Allow this application access to JotForm data
    */
	authorise: function() {
		JF.init({ 
            appName: "Import Submissions", 
            accessType:'full', 
            enableCookieAuth: true
        });
        if(JF.getAPIKey()) {
            this.setup();
        } else {
            JF.login(
                function success(){
                    IS.setup();
                },
                function error(){
                    alert("Could not authorize user");
                }
            );
        }
    },


    setup: function() {
    	this.chooseForm();
    	this.validate();
    	$('APIkey').setValue(JF.getAPIKey());
	},


	/*
	** Ensure that the user has selected a file and form before submission
	*/
	validate: function() {
        $('fileForm').observe('submit', function(event) {
            if($('file').getValue().empty()) {
                $('fileError').show();
                Event.stop(event);
            }
        });
	},


	/*
	**Show template input for currently selected Form
	*/
	createTemplate: function() {
		JF.getFormQuestions(this.formID, function(questions){
			var columnOutput = new Array();
			var dataOutput = [];
            for(var question in questions) {
            	question = questions[question];
            	if(IS.allowable.indexOf(question.type) > -1) {		        
	            	columnOutput.push(question.qid + '_' + question.text + "_" + question.type.split('control_')[1]);
	            	dataOutput.push(IS.getRelevantData(question.type));
	            }
            }
			columnText = '\"' + columnOutput.join('\", \"') + '\"';
			dataText = '\"' + dataOutput.join('\", \"') + '\"';

			$('templateInput').value = columnText + '\n' + dataText
			$('template').show();
			var titles;
			$('xlsHead').update();
			$('xlsHead').insert(titles = new Element('tr'));
			for(var i=0; i<columnOutput.length; i++) {
				titles.insert(new Element('td').update(columnOutput[i]));
			}
			var dataRow;
			$('xlsBody').update();
			$('xlsBody').insert(dataRow = new Element('tr'));
			for(var i=0; i<dataOutput.length; i++) {
				dataRow.insert(new Element('td').update(dataOutput[i]));
			};

		});

	},

	getRelevantData: function(type) {
		type = type.split('control_')[1];
		switch (type) {
			case 'autocomp':
            case 'textbox':
            case 'textarea':
            	return 'sample input text';
            case 'dropdown':
            	return 'optionName';
            case 'email':
            	return 'sample@example.com';
            case 'number':
            case 'spinner':
            	return 214;
            case 'rating':
            	return 3;
            case 'slider':
            	return 57;
            case 'checkbox':
            	return 'option1,option3,option5';
            case 'radio':
            	return 'option3';
            case 'datetime':
            	return '2013-12-31 17:22';
            case 'birthdate': 
            	return '1982-07-30';
            case 'time':
            	return '07:30am-10:30pm';
            case 'range':
            	return '10-37';
            case 'grading':
            	return '10, 4, 25';
            case 'phone':
            	return '01562, 8918929';
            case 'fullname':
            	return 'Smith, John';
            case 'address':
            	return '356 Fifth Avenue, Manhattan, New York, New York State, 10009, United States';
            default:
            	return 'sample ' + type;
        }
	},


    chooseForm: function() {
        $('chooseForm').observe('click', function() {

			$('chooseForm').disable();
            $('info').hide();

            JF.FormPicker({
                sort: 'title',
                multiSelect: false,
                onSelect: function(selectedForms) {
                    if(selectedForms.length > 0) {
                    	$('control').show();
                        $('formName').update(selectedForms[0].title);
                    	IS.formID = selectedForms[0].id;
                    	$('formID').setValue(IS.formID);
                    	IS.createTemplate();
                    }
                },
                onReady: function() {
                    $('chooseForm').enable();
                }
            });
        });
    }
};

