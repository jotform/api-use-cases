var SidebarView = Backbone.View.extend({

    el: "#sidebar",

    events: {
        "click .tab-link": "activateTab"
    },

    initialize: function(){
        _.bindAll(this, "render");
        this.render();
    },

    render: function(){

    },

    addTab: function(data){
        this.$el.find("li.active").removeClass("active");
        this.$el.find(".mainnav").append('<li class="tab-link active" id="'+data.id+'">'+
                '<i class="icon-th-large"></i>' +
                '<span>' + data.value + '</span>' +
            '</li>');
    },

    activateTab: function(e){
        this.$el.find("li.active").removeClass("active");
        $(e.target).closest("li").addClass("active");
    }

});