var appView = Backbone.View.extend({
    el: "#formList",
    events:
    {
        'click #selectForm': 'loadForm',
    },
    /**
     * Constructor
     */
    initialize: function()
    {
        
        this._elem = {
            formList: $('#formList'),
            homeView: $('#homeView'),
            formError: $('#error'), 
            formSelected_el: $("#userFormsList"),
        }

        _.bindAll(this,
            "render", "loadForm"
        );

        this.render();
    },

    render: function()
    {
        //initialize app name
        JF.initialize({ appName: "Submission-View" });
        //
        self = this;
        
        //Hide all pages
        $('.page').hide();
        
        this._elem.homeView.show();

    },

    loadForm: function(id,title) {

        this.getFormSubmissionsAJAX(id, function(a){
            window.app.form = new formModel(id,a);
            app.form.set({'formTitle':title});
            this._elem.formError.hide();
        }, {
            offset: 0,
            limit: 1000
        });
    },

    /**
     * Alternative way to fetch data from the server
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
        var url = "http://api.jotform.com/form/"+formID+"/submissions?apiKey="+apiKey + offset + limit + orderBy + orderType;
        $.getJSON(url, function(response){
            next.call(self, response.content);
        });
    }
    

});