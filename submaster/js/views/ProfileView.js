var ProfileView = Backbone.View.extend({

    initialize: function(options) {
        this.el = options.el;
        this.template = _.template('<ul class="profile">' + 
                '<li class="daily sub">' +
                '</li>' +
                '<li class="monthly sub">' +
                '</li>' +
                // '<li class="yearly sub">' +
                // '</li>' +                
            '</ul>');
        this.render();
    },

    render: function() {
        var self = this;
        this.$el.html(this.template(window.app.user));

        //get daily submissions and save it in app cache
        window.app.submissionsCollection.fetch(
            {
                filter: {"created_at:gt":moment().format("YYYY-MM-DD")}, 
                limit:1000
            }, 
            function(r){
                console.log(r);
                $(".daily", self.el).html('<span>'+r.length+'</span>' + " submissions today");
            }
        );

        //get monthly submissions
        var d = new Date();
        var y = d.getUTCFullYear(), m = d.getMonth()+1+"", day = "01";
        if(m.length === 1) m = "0" + m;
        var date = moment(y+m+day, "YYYY-MM-DD").format("YYYY-MM-DD");

        window.app.submissionsCollection.fetch(
            {
                filter: {"created_at:gte":date}, 
                limit:1000
            },
            function(r){
                $(".monthly", self.el).html('<span>'+r.length+'</span>' + " submissions this month");
            }
        );     
    }

});