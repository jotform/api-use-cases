
$.noConflict();
document.observe('dom:loaded', function() {
    PF.authorise();
});

PF = {

    url: '',

    allowable: ['autocomp','textbox','email','number','textarea', 'dropdown', 'checkbox', 'radio', 'datetime',
        'time', 'scale', 'spinner', 'range', 'fullname', 'grading', 'birthdate', 'phone', 'address', 'rating',
        'slider', 'hidden'],
    //ntw - currently unable to use populate matrix controls


    simpleInput: ['autocomp','textbox','email','number','textarea', 'scale', 'spinner', 'rating', 'slider', 'hidden'],


    /*
    ** Allow this application access to JotForm data
    */
    authorise: function() {
        JF.initialize({ appName: "Populate Fields"});
        if(JF.getAPIKey()) {
            this.setup();
        } else {
            JF.login(
                function success(){
                    PF.setup();
                },
                function error(){
                    alert("Could not authorize user");
                }
            );
        }
    },

    /*
    **  setup application
    */
    setup: function() {
        this.chooseForm();
        this.generate();
    },


    /*
    **  catch button click that generates the url and displays it on screen
    */
    generate: function() {
        $('generate').observe('click', function() {
            var getValues = '';
            $$('.question').each(function(el) {
                getValues +=  PF.createVariable(el);
            });
            getValues = getValues.replace('&', '?');
            var information = PF.url  + getValues + '<br>';
            information += 'Click <a target="_blank" href="' + PF.url  + getValues + '">here</a> to view the populated form.<br/><br/>'; 
            $('populateURL').update(information);
        });
    },


    /*
    **  Create GET variable from elements contents
    */
    createVariable: function(el){
        var writeLine = function(el, selector, ident) {
            return (el.down('input[id='+selector+']') && el.down('input[id='+selector+']').getValue()) ? '&' + ident  +'['+ selector + ']=' + el.down('input[id='+selector+']').getValue() : '';
        };
        var ident = el.readAttribute('questionIdentifier');
        var type = el.readAttribute('questionType');
        var out = '';
        var inputs = [];

        if(PF.simpleInput.indexOf(type)  > -1) type = 'simple';

        switch (type){
            case 'simple':
                out = (el.down('input').getValue()) ? '&' + ident + '=' + el.down('input').getValue() : '';
                break;

            case 'dropdown':
                out = (el.down('select').getValue()) ? '&' + ident + '=' + el.down('select').getValue() : '';
                break;

            case 'checkbox':
            case 'radio':
                var checked = [];
                el.select('input[type=' + type + ']:checked').each(function(chk) {
                    checked.push(chk.value);
                });
                if(checked.length > 0) out = '&' + ident + '=' + checked.join();
                break;

            case 'birthdate':
                var months =  ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                out += (el.down('input[id=month]').getValue()) ? '&' + ident + '[month]=' + months[parseInt(el.down('input[id=month]').getValue(), 10)-1] : '';
                out += (el.down('input[id=day]').getValue()) ? '&' + ident + '[day]=' +  parseInt(el.down('input[id=day]').getValue()) : '';
                out += writeLine(el, 'year', ident);
                break;

            case 'datetime':
                inputs = ['month','day','year', 'hour', 'min'];
                for(var i=0; i<inputs.length; i++) {
                    out += writeLine(el, inputs[i], ident);
                }
                out += (el.down('select') &&  el.down('select').getValue() == 'PM') ? '&' + ident + '[ampm]=PM': '';
                break;

            case 'time':
                out += writeLine(el, 'hourSelect', ident);
                out += writeLine(el, 'minuteSelect', ident);
                out += (el.down('select[id=ampm]') && el.down('select[id=ampm]').getValue() == 'PM' ) ? '&' + ident + '[ampm]=PM' : '';
                out += writeLine(el, 'hourSelectRange', ident);
                out += writeLine(el, 'minuteSelectRange', ident);
                out += (el.down('select[id=ampmRange]') && el.down('select[id=ampmRange]').getValue() == 'PM' ) ? '&' + ident + '[ampmRange]=PM' : '';
                break;

            case 'range':
                out += writeLine(el, 'from', ident);
                out += writeLine(el, 'to', ident);
                break;

            case 'fullname':
                inputs = ['prefix','first','middle', 'last', 'suffix'];
                for(var i=0; i<inputs.length; i++) {
                    out += writeLine(el, inputs[i], ident);
                }
                break;

            case 'grading':
                var grades = [];
                el.select('input[type=text]').each(function(grade) {
                    grade.value ? grades.push(grade.value) : grades.push('0');
                });
                if(grades.length > 0 && grades.any(function(n) { return n > 0; })) {
                    out = '&' + ident + '=' + grades.join(',');
                }
                break;

            case 'phone':
                inputs = ['country','area','phone'];
                for(var i=0; i<inputs.length; i++) {
                    out += writeLine(el, inputs[i], ident);
                }
                break;

            case 'address':
                inputs = ['addr_line1', 'addr_line2', 'city', 'state', 'postal', 'country'];
                for(var i=0; i<inputs.length; i++) {
                    out += writeLine(el, inputs[i], ident);
                }
                break;
            default:
                console.log('error: createVariable should not make it to default. Current type is ' + type);
                break;
        }

        out = out.replace(/&&/g, '&');
        return out;
    },

    /*
    ** get questions for current form from API and display them to screen
    */
    displayQuestions: function(formID) {
        $('loading').show();
        JF.getFormQuestions(formID, function(questions){
            var output = "";
            var type;

            var orderedQuestions = [];
            for(var question in questions) {
                orderedQuestions.push(questions[question]);
            }
            orderedQuestions.sort(function (a, b) {return parseInt(a.order) - parseInt(b.order);});

            for(var i=0; i<orderedQuestions.length; i++) {
                question = orderedQuestions[i];
                type = question.type.split('control_')[1];
                if(PF.allowable.indexOf(type) > -1) {
                    var questionID = question.qid;
                    var questionTitle = question.text;

                    output += "<div id='" + questionID + "' questionType='" + type + "' questionIdentifier='" + question.name + "' class='question'><label>" + questionTitle + "</label>";
                    output += '<div style="display:inline-block">';

                    if(PF.simpleInput.indexOf(type)  > -1) type = 'simple';

                    switch (type){
                        case 'simple':
                           output += "<input type='text' class='simpleInput' />";
                           break;

                       case 'dropdown':
                            output += "<select>";
                            output += '<option></option>';
                            var options = question.options.split('|');
                            for(var j=0; j<options.length;j++) {
                                output += '<option value="'+options[j]+'">' + options[j] + '</option>';
                            }
                            output += "</select>";
                            break;

                       case 'checkbox':
                       case 'radio':
                            var options = question.options.split('|');
                            for(var j=0; j<options.length;j++) {
                                output += '<input type="' + type + '" name="' + question.name + '"  value="'+options[j]+'" />' + options[j] + '<br>';
                            }
                            break;

                        case 'datetime':
                        case 'birthdate':
                            output += '<input type="text" class="datetime" placeholder="month" id="month" />/';
                            output += '<input type="text" class="datetime" placeholder="day" id="day" />/';
                            output += '<input type="text" class="datetime" placeholder="year" id="year" />';
                            if(question.allowTime == 'Yes') {
                                output += '&nbsp <input type="text" class="datetime" placeholder="hour" id="hour"/>:';
                                output += '<input type="text" class="datetime" placeholder="min" id="min" />';
                                if(question.timeFormat == 'AM/PM') {
                                    output += '<select id="ampm" class="miniSelect">';
                                    output += '<option value="AM">AM</option>';
                                    output += '<option value="PM">PM</option>';
                                    output += '</select>';
                                }
                            }
                            break;

                        case 'time':
                            output += '<input type="text" class="datetime" placeholder="hour" id="hourSelect" />:';
                            output += '<input type="text" class="datetime" placeholder="min" id="minuteSelect" />';
                            if(question.timeFormat == 'AM/PM') {
                                output += '<select id="ampm" class="miniSelect">';
                                output += '<option value="AM">AM</option>';
                                output += '<option value="PM">PM</option>';
                                output += '</select>';
                            }
                            if(question.range == 'Yes') {
                                output += ' until <input type="text" class="datetime" placeholder="hour" id="hourSelectRange"/>:';
                                output += '<input type="text" class="datetime" placeholder="min" id="minuteSelectRange" />';
                                if(question.timeFormat == 'AM/PM') {
                                    output += '<select id="ampmRange" class="miniSelect">';
                                    output += '<option value="AM">AM</option>';
                                    output += '<option value="PM">PM</option>';
                                    output += '</select>';
                                }
                            }
                            break;

                        case 'range':
                            output += "<input type='text' id='from' />";
                            output += "<input type='text' id='to' />";
                            break;

                        case 'fullname':
                            output += (question.prefix == 'Yes') ? '<input type="text" id="prefix" class="miniInput" placeHolder="prefix"/>': '';
                            output += '<input type="text" id="first" placeHolder="first name" class="shortInput"/>';
                            output += (question.prefix == 'Yes') ? '<input type="text" id="middle" placeHolder="middle name" class="shortInput"/>' : '';
                            output += '<input type="text" id="last" placeHolder="last name" class="shortInput" />';
                            output += (question.suffix == 'Yes') ? '<input type="text" id="suffix" class="miniInput" placeholder="suffix" />' : '';
                            break;

                        case 'grading':
                            var options = question.options.split('|');
                            for(var j=0; j<options.length;j++) {
                                output += '<input type=text  class="miniInput" /> ' + options[j] + '<br>';
                            }
                            break;

                        case 'phone':
                            output += (question.countryCode) ? '<input type="text" id="country" placeHolder="country" class="shortInput"/>' : '';
                            output += '<input type="text" id="area" placeHolder="area" class="shortInput"/>';
                            output += '<input type="text" id="phone" placeHolder="phone" class="shortInput"/>';
                            break;

                        case 'address':
                            output += '<input type="text" id="addr_line1" placeHolder="address line 1" class="simpleInput"/><br>';
                            output += '<input type="text" id="addr_line2" placeHolder="address line 2" class="simpleInput"/><br>';
                            output += '<input type="text" id="city" placeHolder="city" class="simpleInput"/><br>';
                            output += '<input type="text" id="state" placeHolder="state" class="simpleInput"/><br>';
                            output += '<input type="text" id="postal" placeHolder="postal" class="simpleInput"/><br>';
                            output += '<input type="text" id="country" placeHolder="country" class="simpleInput"/><br>';
                            break;

                        default:
                            console.log('error: displayQuestions should not make it to default. Current type is ' + type);
                            break;
                    }
                    output += '</div>';
                    output += '</div>';
                }
            }
            $('form').update(output);
            $('generate').show();
            $('loading').hide();
        });
    },

    /*
    ** User chooses which form they want to use
    */

    chooseForm: function() {
        $('chooseForm').observe('click', function() {
            JF.FormPicker({
                sort: 'title',
                multiSelect: false,
                onSelect: function(selectedForms) {
                    if(selectedForms.length > 0) {
                        console.log(selectedForms[0]);
                        PF.url = selectedForms[0].url;
                        PF.displayQuestions(selectedForms[0].id);

                    }
                }
            });
        });
    }
};

