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
        if($('#'+data.id, this.el).length > 0) {
            $('#'+data.id, this.el).addClass("active");
            this.showTab(data.id);
            return ;
        }
        
        this.$el.find(".mainnav").append('<li class="tab-link active" id="'+data.id+'">'+
                '<i class="icon-th-large"></i>' +
                '<span>' + data.value + '</span>' +
            '</li>');
        $('#tab-content').append('<div class ="content" id="'+data.id+'-tab">'+app.formsCollection.get(data.id).get("title")+'</div>');        
        this.showTab(data.id);
    },

    activateTab: function(e){
        var li = $(e.target).closest("li");
        window.app.router.navigate(li.attr("id") === 'home' ? '' : li.attr("id"), { trigger: true });
    },

    showTab: function(id){
        this.$el.find("li.active").removeClass("active");
        $('.mainnav #'+id).addClass("active");     
        $('#tab-content .content:visible').hide();
        $('#tab-content #'+id+'-tab').show();
    }


});