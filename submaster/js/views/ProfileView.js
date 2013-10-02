var ProfileView = Backbone.View.extend({

    initialize: function(options) {
        this.el = options.el;
        this.template = _.template( '<div class="userinfo" style="float:left;">' +
                                        '<img id="avatar" style="margin:0 12px; border-radius:32px;"/>' +
                                        '<span id="username"></span>'
                                      + '<ul class="profile">' + 
                '<li class="daily sub">' +
                '</li>' +
                '<li class="monthly sub">' +
                '</li>' +
                // '<li class="yearly sub">' +
                // '</li>' +                
            '</ul> </div>' 
            + '<div style="float:left; width: 200px; height:100px;"><div id="submissions"></div></div>'
            + '<div style="float:left; width: 200px; height:100px;"><div id="payments"></div></div>'
            + '<div style="float:left; width: 200px; height:100px;"><div id="ssl"></div></div>'
            + '<div style="float:left; width: 200px; height:100px;"><div id="uploads"></div>'
            );
        this.render();
    },

    render: function() {
        var self = this;
        this.$el.append(this.template(window.app.user));
        $("#username").html("Welcome " + window.app.user.name);
        $("#avatar").attr("src", window.app.user.avatarUrl);

        var submissionsGage = new JustGage({
            id: "submissions", 
            value: 17, 
            min: 0,
            max: 100,
            title: "Submissions",
            // valueFontColor : 'rgba(255,255,255,0)',
            // titleFontColor : 'rgba(255,255,255,0)'
        });
        var paymentsGage = new JustGage({
            id: "payments", 
            value: 47, 
            min: 0,
            max: 100,
            title: "Payments",
            // valueFontColor : 'rgba(255,255,255,0)',
            // titleFontColor : 'rgba(255,255,255,0)'
        }); 
        var sslGage = new JustGage({
            id: "ssl", 
            value: 67, 
            min: 0,
            max: 100,
            title: "SSL Submissions",
            // valueFontColor : 'rgba(255,255,255,0)',
            // titleFontColor : 'rgba(255,255,255,0)'
        });                  
        var uploadsGage = new JustGage({
            id: "uploads", 
            value: 87, 
            min: 0,
            max: 100,
            title: "Uploads",
            // valueFontColor : 'rgba(255,255,255,0)',
            // titleFontColor : 'rgba(255,255,255,0)'
        }); 
        // var $subLoader = $("#submissions").percentageLoader({width: 96, height: 96, controllable : true, progress : 0.8, onProgressUpdate : function(val) {
        //   $subLoader.setValue(Math.round(val * 100.0));
        // }}); 
        // $subLoader.setValue('0'); 

        // var $payLoader = $("#payments").percentageLoader({width: 96, height: 96, controllable : true, progress : 0.8, onProgressUpdate : function(val) {
        //   $payLoader.setValue(Math.round(val * 100.0));
        // }}); 
        // $payLoader.setValue('0');  
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