var SidebarView = Backbone.View.extend({

    el: "#sidebar",

    events: {
        "click .tab-link": "activateTab"
    },

    initialize: function(){
        this.render();
    },

    render: function(){

    },

    addTab: function(data){
        this.$el.find("li.active").removeClass("active");

        if($('#'+data.id+'-link', this.el).length > 0) {
            $('#'+data.id+'-link', this.el).addClass("active");
            this.showTab(data.id);
            return ;
        } else {
            if(!$("#loader").is(":visible")) {
                window.showLoader();
                $("#loaderMsg").html("Getting form data...");
            }
        }
        
        this.$el.find(".mainnav").append('<li class="tab-link active" data-tab="'+data.id+'"id="'+data.id+'-link">'+
                '<i class="icon-th-large"></i>' +
                '<span>' + data.value + '</span>' +
            '</li>');

        //create form tab
        $('#tab-content').append(_.template($("#new-tab-template").html())({
            id: data.id,
            title: app.formsCollection.get(data.id).get("title")
        }));

        // new FormSubmissionsGridView({
        //     formModel: app.formsCollection.get(data.id),
        //     el: $('#'+data.id+'-tab')
        // });

        this.showTab(data.id);

        //create submission calendar for form
        window.app["submissionCalendarView" + data.id] = new SubmissionsCalendarView({
            el: $("#calendar-"+data.id),
            form : true,
            formId : data.id
        });       
    },

    activateTab: function(e){
        var li = $(e.target).closest("li");
        window.app.router.navigate(li.attr("data-tab") === 'home' ? '' : li.attr("data-tab"), { trigger: true });
    },

    showTab: function(id){
        this.$el.find("li.active").removeClass("active");
        $('.mainnav #'+id+"-link").addClass("active");     
        $('#tab-content .content:visible').hide();
        $('#tab-content #'+id+'-tab').show();
    }


});