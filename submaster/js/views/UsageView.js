/**
 * creates usage view with gauges.js
 * depends justgage.1.0.1.min.js
 * see: http://www.justgage.com/
 */

var UsageView = Backbone.View.extend({

    initialize: function(options){
        _.bindAll(this, "render");
        this.el = options.el;
        this.template = _.template(
            '<div class="usages-wrapper" id="<%=id%>-preview">' +
                //'<div class=""id="<%=id%>-preview"></div>'+
                // '<canvas id="<%=id%>" width="100" height="50"></canvas>'+
                // '<div class="usages-text"><%=name%></div>'+
            '</div>'); 
            
            // '<canvas id="sslsubmissions"></canvas>' +
            // '<canvas id="payments"></canvas>' +
            // '<canvas id="uploads"></canvas>');
        this.render();
    },

    render: function(){
        //usage does not include limit data now so for this i will work on mock data
        var mock = {
            submissions: 75,
            sslSubmissions: 40,
            payments: 450,
            uploads: 7553708,

            limits: {
                submissions: 100,
                sslSubmissions: 1000,
                payments: 500,
                uploads: 1000000000
            }
        }

        cases = [{id: "submissions", name: "Submissions", value: 75, limit: 100}, 
        {id: "sslSubmissions", name: "SSL Submissions", value: 40, limit: 1000}, 
        {id: "payments", name: "Payments", value:490, limit: 500}, 
        {id: "uploads", name: "Uploads", value: 7553708, limit: 10000000}];

        for(var i=0; i<cases.length; i++){
            this.$el.append(this.template(cases[i]));
        }

        //this.$el.html(this.template()(cases[i]));

        // var submissions = mock.submissions,
        // submissionsLimit = mock.limits.submissions,
        // sslSubmissions = mock.sslSubmissions,
        // sslSubmissionsLimit = mock.limits.sslSubmissions,
        // payments = mock.payments,
        // paymentsLimit = mock.limits.payments,
        // uploads = mock.uploads,
        // uploadsLimit = mock.limits.uploads;

        // var opts = {
        //   lines: 12, // The number of lines to draw
        //   angle: 0, // The length of each line
        //   lineWidth: 0.22, // The line thickness
        //   pointer: {
        //     length: 0.9, // The radius of the inner circle
        //     strokeWidth: 0.035, // The rotation offset
        //     color: '#000000' // Fill color
        //   },
        //   limitMax: 'false',   // If true, the pointer will not go past the end of the gauge

        //   colorStart: '#6FADCF',   // Colors
        //   colorStop: '#8FC0DA',    // just experiment with them
        //   strokeColor: '#E0E0E0',   // to see which ones work best for you
        //   generateGradient: true
        // };

        for(var i=0; i<cases.length; i++){
            var g1 = new JustGage({
              id: cases[i].id+"-preview", 
              value: cases[i].value, 
              min: 0,
              max: cases[i].limit,
              title: cases[i].name,
              label: ""
            });            
        }        
    }

});