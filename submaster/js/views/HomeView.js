var HomeView = Backbone.View.extend({

    el: "#home-tab",

    initialize: function(options) {
        _.bindAll(this, "render");
        this.render();
    },

    render: function(){
        
        //$("#main").css("width", window.innerWidth-228);
        //set containers width
        var w = window.innerWidth-$("#sidebar").width();
        $("#container").width(w-20);

        window.onresize = function(){
            var w = window.innerWidth-$("#sidebar").width();
            $("#container").width(w-20);            
        }
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

        window.app.usagesView= new UsagesKnobView({
            el: document.getElementById("usage-knobs")
        });

        window.app.profileView = new ProfileView({
            el: $("#profile")[0]
        });
        
        window.app.submissionsCalendarView = new SubmissionsCalendarView({
            el: $("#calendar")[0]
        });       
    }

});