var submissionView = Backbone.View.extend({
    el: "#submissionView",
    
    /**
     * Constructor
     */
    initialize: function()
    {

        form = window.app.form;

        _.bindAll(this,
            "render","getDefaultBody"
        );

        this.render();
    },

    render: function()
    {
        //this.getBody();
        $('.page').hide();
        this.view();
        $(this.el).show();
    },

    getDefaultBody: function() {
        return $("#submission-template").html();
    },


    view: function()
    {
        self = this;
        var url = "view.php";
        //var fields = this.getRenderData();
        $.post(url, {'username': window.app.user.username, 'id': self.id }, function(response) {
            if(response)
            {
                $(self.el).html(response);
            }
            else
            {
                $(self.el).html("There is no template. <a href='#create'> Create it now</a>");
            }
        });
        
    }
});