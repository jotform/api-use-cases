var submissionListView = Backbone.View.extend({
    el: "#submissionListView",
    events:
    {
        'click .Submission': 'getSubmissionPage',
    },
    /**
     * Constructor
     */
    initialize: function()
    {

        this._elem = {
            formList: $("#formList"),
            list_el: $('#SubmissionList'),   //list of forms
        }

        _.bindAll(this,
            "render", "listData", "getSubmissionPage"
        );

        this.render();
    },

    render: function()
    {
        $('.page').hide();
        
        this._elem.list_el.html('');
        this.listData(window.app.form.get('submissions'));
        $(this.el).show();
        
    },

    /**
     * Get all submission from an specific form
     * @param formID - the form ID on where to get all forms
     * @param next - callback after all forms has been fetched
     */   
    listData: function(a)
    {
        var length = a.length;
        var submissions = a.models;
        var counter = 0;
        headerData = submissions[0].get('answers');
        len = Object.keys(headerData).length;
        row = 12 - 3; // -2 for ID column -1 for textarea
        span = (len<10)? Math.floor(row/len): 1;
        htmlData = "<div class='row-fluid'>";
        htmlData += "<div class='span2 header'> ID </div>";
        var columns = 0;
        for(var header in headerData)
        {   
            if(columns == 9) break;
            fspan = (headerData[header].type == 'control_textarea')? span + 1 : span;         
            htmlData += "<div class='span" + fspan + " header'>" + headerData[header].text + "</div>";
            columns++;
        }
        htmlData += "</div>";
        this._elem.list_el.append(htmlData);

        for( var i in submissions )
        {
            var data = submissions[i];
            answers = data.get('answers');
            htmlData = "<div class='row-fluid list'>";
            htmlData += "<div id='" + data.get('id') + "' class='Submission btn btn-success span2'>" + data.get('id') + "</div>";
            columns = 0;
            for(var index in answers)
            {   
                if(columns == 9) break;
                answer = answers[index];
                if(answer.answer == null) answer.answer = '';
                var text = answer.answer;
                if(answer.type == 'control_fileupload') 
                {
                    if(answer.answer[0])
                    {
                        text = answer.answer[0].substring(answer.answer[0].lastIndexOf('/') + 1);
                    } 
                }
                if(answer.type == 'control_fullname' || answer.type == 'control_phone') 
                {
                    text = answer.prettyFormat;
                }
                fspan = (answer.type == 'control_textarea')? span + 1 : span;          
                htmlData += "<div class='span" + fspan + " columnCell'>" + text + "</div>";
                columns++;
            }
            htmlData += "</div>";
            this._elem.list_el.append(htmlData);   
        }
        //call callback(instance, formatted array data, all objects)
        
    },

    getSubmissionPage: function(e)
    {
        var clickedEl = $(e.currentTarget);
        var id = clickedEl.attr("id");
        app.router.navigate('submission/'+id, {trigger : true});
    }

});