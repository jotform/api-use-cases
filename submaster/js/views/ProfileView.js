var ProfileView = Backbone.View.extend({

    initialize: function(options) {
        this.el = options.el;
        this.template = _.template('<ul class="profile">' + 
                '<li class="user-info">'+
                    '<p style="display:inline-block;">Welcome <%=name%></p>' +
                    '<img class="avatar" src="<%=avatarUrl%>"/>' +
                '</li>' + 
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
        JF.getSubmissions(function(r){
            window.app.cache.dailySubmissions = r;
            $(".daily", self.el).html('<span>'+r.length+'</span>' + " submissions today");
        }, {filter: {"created_at:gte":moment().format("YYYY-MM-DD")}, limit:1000});

        //get monthly submissions
        var d = new Date();
        var y = d.getUTCFullYear(), m = d.getMonth()+1+"", day = "01";
        if(m.length === 1) m = "0" + m;
        var date = moment(y+m+day, "YYYY-MM-DD").format("YYYY-MM-DD");
        JF.getSubmissions(function(r){
            window.app.cache.monthlySubmissions = r;
            $(".monthly", self.el).html('<span>'+r.length+'</span>' + " submissions this month");
        }, {filter: {"created_at:gte":date}, limit:1000});

        //get yearly submissions
        // JF.getSubmissions(function(r){
        //     window.app.cache.yearlySubmissions = r;
        //     $(".yearly", self.el).html('<span>'+r.length+'</span>' + " submissions this year");
        // }, {filter: {"created_at:gte":y+"-01-01"}, limit:1000});        
    }

});