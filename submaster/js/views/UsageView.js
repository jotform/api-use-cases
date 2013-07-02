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
                '<div id="<%=id%>-textfield"></div>'+
                // '<div class="" id="<%=id%>-preview"></div>'+
                '<canvas id="<%=id%>" style="width:100%" height="50"></canvas>'+
                '<div class="usages-text"><%=name%></div>'+
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
        {id: "uploads", name: "Uploads", value: Math.ceil(this.bytesToHuman(7553708)), limit: Math.ceil(this.bytesToHuman(100000000))}];

        for(var i=0; i<cases.length; i++){
            this.$el.find(".widget-content").append(this.template(cases[i]));
        }

        //this.$el.find("#submissions-preview").addClass("big");
        //this.$el.find("#submissions-preview").after("<div></div>");
        //this.$el.html(this.template()(cases[i]));

        // var submissions = mock.submissions,
        // submissionsLimit = mock.limits.submissions,
        // sslSubmissions = mock.sslSubmissions,
        // sslSubmissionsLimit = mock.limits.sslSubmissions,
        // payments = mock.payments,
        // paymentsLimit = mock.limits.payments,
        // uploads = mock.uploads,
        // uploadsLimit = mock.limits.uploads;

        var opts = {
          lines: 12, // The number of lines to draw
          angle: 0, // The length of each line
          lineWidth: 0.32, // The line thickness
          pointer: {
            length: 0.9, // The radius of the inner circle
            strokeWidth: 0.035, // The rotation offset
            color: '#000000' // Fill color
          },
          limitMax: 'false',   // If true, the pointer will not go past the end of the gauge

          colorStart: '#6FADCF',   // Colors
          colorStop: '#8FC0DA',    // just experiment with them
          strokeColor: '#E0E0E0',   // to see which ones work best for you
          generateGradient: true
        };

        for(var i=0; i<cases.length; i++){
            // var g1 = new JustGage({
            //   id: cases[i].id+"-preview", 
            //   value: cases[i].value, 
            //   min: 0,
            //   max: cases[i].limit,
            //   title: cases[i].name,
            //   label: ""
            // }); 
            var target = document.getElementById(cases[i].id); // your canvas element
            var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
            gauge.maxValue = cases[i].limit; // set max gauge value
            gauge.animationSpeed = 32; // set animation speed (32 is default value)
            gauge.set(cases[i].value);
            gauge.setTextField(document.getElementById(cases[i].id + "-textfield"));
        }
/*        for(var i=0; i<cases.length; i++){
            $('#'+cases[i].id+'-preview').highcharts({
            
                chart: {
                    type: 'gauge',
                    plotBackgroundColor: null,
                    plotBackgroundImage: null,
                    plotBorderWidth: 0,
                    plotShadow: false,
                    spacingTop: 0,
                    marginTop: 0,
                    height: 160
                },
                credits: {
                    enabled: false
                },                
                title: {
                    text: cases[i].name,
                    enabled: false
                },
                
                pane: {
                    startAngle: -150,
                    endAngle: 150,
                    background: [{
                        backgroundColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                                [0, '#FFF'],
                                [1, '#333']
                            ]
                        },
                        borderWidth: 0,
                        outerRadius: '109%'
                    }, {
                        backgroundColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                                [0, '#333'],
                                [1, '#FFF']
                            ]
                        },
                        borderWidth: 1,
                        outerRadius: '107%'
                    }, {
                        // default background
                    }, {
                        backgroundColor: '#DDD',
                        borderWidth: 0,
                        outerRadius: '105%',
                        innerRadius: '103%'
                    }]
                },
                   
                // the value axis
                yAxis: {
                    min: 0,
                    max: cases[i].limit,
                    
                    minorTickInterval: 'auto',
                    minorTickWidth: 0,
                    minorTickLength: 10,
                    minorTickPosition: 'inside',
                    minorTickColor: '#666',
            
                    tickPixelInterval: 30,
                    tickWidth: 0,
                    tickPosition: 'inside',
                    tickLength: 10,
                    tickColor: '#666',
                    labels: {
                        step: 2,
                        rotation: 'auto'
                    },
                    title: {
                        text: ''
                    },
                    plotBands: [{
                        from: 0,
                        to: cases[i].limit*0.6,
                        color: '#55BF3B' // green
                    }, {
                        from: cases[i].limit*0.6,
                        to: cases[i].limit*0.8,
                        color: '#DDDF0D' // yellow
                    }, {
                        from: cases[i].limit*0.8,
                        to: cases[i].limit,
                        color: '#DF5353' // red
                    }]        
                },
            
                series: [{
                    name: 'Speed',
                    data: [cases[i].value],
                    tooltip: {
                        valueSuffix: ' km/h'
                    }
                }]
            
            })              
            
        } */ 
    },

            //helper functions for formatting usage values
    bytesToHuman: function(octets){
        units = ['B', 'kB', 'MB', 'GB', 'TB']; // ...etc
        for (var i = 0, size = octets; size > 1024; size=size/1024){ i++; }
        return numberFormat(size, 2);

        function numberFormat(number, decimals, dec_point, thousands_sep){
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
        };

    }

});