var HomeView = Backbone.View.extend({

    el: "#home",

    initialize: function(options) {
        _.bindAll(this, "render");
        this.render();
    },

    render: function(){
        
        $("#main").css("width", window.innerWidth-228);
        
        this.$el.show();

        window.app.formsColumnChartView = new FormsColumnChartView({
            el: $("#newest-forms")[0],
            field: "new",
            color: "#EC8D00"
        });

        window.app.formsColumnChartViewForCount = new FormsColumnChartView({
            el: $("#fullest-forms")[0],
            field: "count",
            color: "#6895C1"
        });

        // window.app.usageView= new UsageView({
        //     el: document.getElementById("usage")
        // });

        window.app.profileView = new ProfileView({
            el: $("#profile")[0]
        });
        
        window.app.submissionsCalendarView = new SubmissionsCalendarView({
            el: $("#calendar")[0]
        });       
    }

});