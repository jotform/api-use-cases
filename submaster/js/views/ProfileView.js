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
            + '<div style="float:left; width: 175px; height:100px;"><div id="submissions"></div></div>'
            + '<div style="float:left; width: 175px; height:100px;"><div id="payments"></div></div>'
            + '<div style="float:left; width: 175px; height:100px;"><div id="ssl"></div></div>'
            + '<div style="float:left; width: 175px; height:100px;"><div id="uploads"></div>'
            );
        this.render();
    },

    render: function() {
        var self = this;
        this.$el.append(this.template(window.app.user));
        $("#username").html("Welcome " + window.app.user.name);
        $("#avatar").attr("src", window.app.user.avatarUrl);

        JF.getPlan(window.app.user.account_type, function(r) {
            var sLimit = r.limits.submissions;
            var submissionsGage = new JustGage({
                id: "submissions", 
                value: window.app.usage.submissions, 
                min: 0,
                max: sLimit,
                title: "Submissions"
            });
            var paymentsGage = new JustGage({
                id: "payments", 
                value: window.app.usage.payments, 
                min: 0,
                max: r.limits.payments,
                title: "Payments"
            }); 
            var sslGage = new JustGage({
                id: "ssl", 
                value: window.app.usage.ssl_submissions, 
                min: 0,
                max: r.limits.sslSubmissions,
                title: "SSL Submissions"
            });            
            var uploadsGage = new JustGage({
                id: "uploads", 
                value: window.app.usage.uploads,
                min: 0,
                max: r.limits.uploads,
                title: "Uploads"
            }); 
        });
 
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
    },
    bytesToHuman: function(octets){
        for (var i = 0, size = octets; size > 1024; size=size/1024){ i++; }
        return this.numberFormat(size, 2);
    },
    numberFormat: function(number, decimals, dec_point, thousands_sep){
        var n = number, prec = decimals;
        var toFixedFix = function(n, prec){
            var k = Math.pow(10, prec);
            return (Math.round(n * k) / k).toString();
        };
        n = !isFinite(+n) ? 0 : +n;
        prec = !isFinite(+prec) ? 0 : Math.abs(prec);
        var sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep;
        var dec = (typeof dec_point === 'undefined') ? '.' : dec_point;
        var s = (prec > 0) ? toFixedFix(n, prec) : toFixedFix(Math.round(n), prec);
        var abs = toFixedFix(Math.abs(n), prec);
        var _, i;
        if (abs >= 1000) {
            _ = abs.split(/\D/);
            i = _[0].length % 3 || 3;
            _[0] = s.slice(0, i + (n < 0)) + _[0].slice(i).replace(/(\d{3})/g, sep + '$1');
            s = _.join(dec);
        } else {
            s = s.replace('.', dec);
        }

        if (s.indexOf(dec) === -1 && prec > 1) {
            var preca = [];
            preca[prec-1] = undefined;
            s += dec + preca.join(0) + '0';
        } else if (s.indexOf(dec) == s.length - 2) { // incorrect: 2.7,  correct: 2.70
            s += '0';
        }
        return s;
    }

});