var SidebarView = Backbone.View.extend({

    el: "#sidebar",

    initialize: function(){
        _.bindAll(this, "render");
        this.render();
    },

    render: function(){
        //calculate and set height
        // var height = window.innerHeight - 60;

        this.$el.show();
        // this.$el.css("height", height+"px");

    }

});