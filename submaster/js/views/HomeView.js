var HomeView = Backbone.View.extend({

    el: "#home",

    initialize: function(options) {
        _.bindAll(this, "render");
        this.render();
    },

    render: function(){
        
        $("#main").css("width", window.innerWidth-228);
        
        this.$el.show();

        window.app.newestFormsList = new FormsBarChartView({
            el: $("#newest-forms")[0]
            //data: window.app.formsCollection.getForms("new", 0, 5)
        });
    }

});