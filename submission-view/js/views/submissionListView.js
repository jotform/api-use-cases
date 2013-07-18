var submissionListView = Backbone.View.extend({
    el: "#submissionView",
    events:
    {
        'click #getFormSubmissions': 'getFormSubmissionsEvt',
        'click .Submission': 'getSubmissionPage',
    },
    /**
     * Constructor
     */
    initialize: function()
    {
        this._elem = {
            formSelected_el: $("#userFormsList"),
            list_el: $('#SubmissionList'),   //list of forms
        }

        _.bindAll(this,
            "render", "getFormSubmissions"
        );

        this._elem.list_el.html('');
        this.render();
    },

    render: function()
    {
        // console.log('testing view');

        //initialize app name
        JF.initialize({ appName: "Submission-View" });
    },

    showStart: function()
    {
        console.log("please wait");
    },

    showEnd: function()
    {
        console.log('done');
    },

    /**
     * Get all submission from an specific form
     * @param formID - the form ID on where to get all forms
     * @param next - callback after all forms has been fetched
     */
    getFormSubmissions: function( formID, next )
    {
        var self = this;
        var formElem = this._elem.formSelected_el.find(":selected");
        this._elem.list_el.html('');
        this.formID = formElem.val();
        //app.router.navigate(this.formID + '/');
        this.formTitle = $.trim(formElem.text().split('-')[0]);
        var getData = function(self, a, next)
        {
            var length = a.length;
            var counter = 0;
            headerData = a[0].answers;
            htmlData = "<div class='row-fluid'>";
            htmlData += "<div class='span2 header'> ID </div>";
            for(var header in headerData)
            {               
                htmlData += "<div class='span2 header'>" + headerData[header].text + "</div>";
            }
            htmlData += "</div>";
            self._elem.list_el.append(htmlData);

            for( var i in a )
            {
                var data = a[i];
                htmlData = "<div class='row-fluid'>";
                htmlData += "<div id='" + data.id + "' class='Submission btn btn-success span2'>" + data.id + "</div>";
                for(var index in data.answers)
                {   
                    answer = data.answers[index];
                    var text = answer.answer;
                    if(answer.type == 'control_fileupload') 
                    {
                        text = answer.answer[0].substring(answer.answer[0].lastIndexOf('/') + 1);
                    }
                    if(answer.type == 'control_fullname') 
                    {
                        text = answer.prettyFormat;
                    }            
                    htmlData += "<div class='span2 columnCell'>" + text + "</div>";
                }
                htmlData += "</div>";
                self._elem.list_el.append(htmlData);
                counter++;    
            }
            //call callback(instance, formatted array data, all objects)
            
        };

        self.showStart();

        console.log('from request');
        this.getFormSubmissionsAJAX(formID, function(a){
            getData( self, a, next );
            window.app.form = new formModel(this.formID,a);
            app.form.set({'formTitle':this.formTitle});
        }, {
            offset: 0,
            limit: 1000
        });
    },

    /**
     * Alternative way to fetch data from teh server
     */
    getFormSubmissionsAJAX: function( formID, next, query )
    {
        var offset = "",
            limit = "",
            orderBy = "",
            orderType = "",
            self = this;

        //if query object existed
        if ( query && typeof query === 'object' )
        {
            offset = ( query.offset ) ? "&offset=" + query.offset : "";
            limit = ( query.limit ) ? "&limit=" + query.limit : "";
            orderBy = ( query.orderBy ) ? "&orderBy=" + query.orderBy: "";
            if ( query.orderType && ( query.orderType === 'ASC' || query.orderType === 'DESC' ) )
            {
                orderType =  ( query.orderType ) ? "." + query.orderType : "";
            }
        }

        var apiKey = JF.getAPIKey();
        var url = "http://api.jotform.com/form/"+self.formID+"/submissions?apiKey="+apiKey + offset + limit + orderBy + orderType;
        $.getJSON(url, function(response){
            next.call(self, response.content);
        });
    },

    /**
     * Function event when the form submission is clicked
     */
    getFormSubmissionsEvt: function()
    {

        app.router.navigate('form', {trigger : true});

        return false;
    },

    getSubmissionPage: function(e)
    {
        var clickedEl = $(e.currentTarget);
        var id = clickedEl.attr("id");
        app.router.navigate('submission/'+id, {trigger : true});
    }

});