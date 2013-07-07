var HomeView = Backbone.View.extend({

    el: "#home",

    initialize: function(options) {
        _.bindAll(this, "render");
        this.render();
    },

    render: function(){
        
        $("#main").css("width", window.innerWidth-228);
        
        this.$el.show();

        window.app.formsBarChartView = new FormsBarChartView({
            el: $("#newest-forms")[0]
            //data: window.app.formsCollection.getForms("new", 0, 5)
        });

        window.app.usageView= new UsageView({
            el: document.getElementById("usage")
        });

        window.app.profileView = new ProfileView({
            el: $("#profile").find(".widget-content")[0]
        });

        window.app.submissionsCalendarView = new SubmissionsCalendarView({
            el: $("#calendar")[0]
        });       
    }

});