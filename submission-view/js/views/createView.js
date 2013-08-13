var createView = Backbone.View.extend({
    el: "#createView",
    events:
    {
        'click #listTemplate': 'listView',
        'click #saveTemplate': 'saveTemplate',
        'click #preview': 'preview',
    },
    /**
     * Constructor
     */
    initialize: function()
    {

        this._elem = {
            edit_view_el: $("#editview"),
            edit_view_id: "editview",
            fields: $('#fields'),
            select: $('#selectContainer'),
            saveTemplate: $('#saveTemplate'),
        }
        //get form data
        form = window.app.form;
        //$(this._elem.edit_view_el).show();

        _.bindAll(this,
            "render", "getDefaultBody","saveTemplate","getBody","preview"
        );

        this.render();
    },

    render: function()
    {
        $('.page').hide();
        this.getBody(); 
    },

    getDefaultBody: function() {
        return $("#submission-template").html();
    },

    getBody: function() {
        
            if (form)
            {
                self = this;
                if(!form.get('body'))
                {
                    var url = "load.php";
                    $.post(url, {'FormID':form.id}, function(response) {
                        if(!response.value)
                        {
                            //get default view body 
                            form.set({'body': self.getDefaultBody()})
                        }
                        else
                        {
                            form.set({'body': response.value})
                        }
                        //put view body into textarea
                        $(self.el).show();
                        var ed = tinyMCE.get('viewTemplate');
                        ed.setContent(form.get('body'));
                        
                    },'json');
                }
                else
                {
                    $(this.el).show();
                    var ed = tinyMCE.get('viewTemplate');
                    ed.setContent(form.get('body'));
                }
                tinyMCE.activeEditor.dom.loadCSS('css/bootstrap.min.css');
                if (form.get('fields'))
                {
                    var fields = '<h3>Form Fields</h3><br/><ul>';
                    $.each(form.get('fields'), function(type,field){
                        if(field)
                        {
                            fields += "<li class='field' id='"+ field.replace(/\s|\-/g,'_').toLowerCase() +"'>" + field + "</li>";
                        } 
                    });
                    fields += "</ul>"
                    this._elem.fields.html(fields);
                    $('.field').click(function()
                        {
                            tinymce.activeEditor.execCommand('mceInsertContent', false, "{$" + this.id + "}");
                            self._elem.saveTemplate.text('Save Template');
                            self._elem.saveTemplate.removeAttr('disabled');
                        });
                }
            }
            else
            {
                window.app.router.navigate('',{trigger:true})
            }
        
    },

    saveTemplate: function() {
        var ed = tinyMCE.get('viewTemplate');
        html = ed.getContent();
        self = this;
        //save template to DB
        $.post('save.php', {'formID':form.id, 'apiKey': JF.getAPIKey(), 'html': html}, function(response) {
            form.set({'body': html});
            if(response.value == 'success')
            {
                self._elem.saveTemplate.removeClass('btn-danger').addClass('btn-success');
                self._elem.saveTemplate.text('Saved');
                self._elem.saveTemplate.attr("disabled","disabled");
            }
            else
            {
                self._elem.saveTemplate.removeClass('btn-success').addClass('btn-danger');
            }
        }, 'json');
    },
    preview: function() {
        var html = tinyMCE.get('viewTemplate').getContent();
        submission = form.get('submissions').models[2];
        answers = submission.get('answers');
        html = html.replace("{$form_id}",form.get('id'));
        html = html.replace("{$id}",submission.get('id'));
        for(var index in answers)
            {   
                answer = answers[index];
                if(answer.answer == null) answer.answer = '';
                if(answer.text == null) answer.text = '';
                var text = answer.answer;
                var tag = '{$'+answer.text.replace(/\s|\-/g,'_').toLowerCase()+'}';
                if(answer.type == 'control_fileupload') 
                {
                    if(answer.answer[0])
                    {
                        text = "<img src='" + answer.answer[0] + "' alt='Image' />";
                    } 
                }
                if(answer.type == 'control_signature')
                {
                    text = "<img src='" + answer.answer + "' alt='Signature' />";
                }
                if(answer.type == 'control_signature')
                {
                    text = "<a src='" + answer.answer + "' alt='Signature' />";
                }
                if(answer.type == 'control_fullname' || answer.type == 'control_phone') 
                {
                    text = answer.prettyFormat;
                }
                html = html.replace(tag,text);
            }

        $('#previewDiv').html(html);
        $('#previewDiv').show();
    }

});