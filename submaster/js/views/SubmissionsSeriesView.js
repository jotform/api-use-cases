var SubmissionsSeriesView = Backbone.View.extend({


    initialize: function(options) {
        this.data = options.data;
        this.start = options.start;
        console.log(this.data, this.start);
        this.el = options.el;

        console.log(this.el);
        this.render();
    },

    render: function() {
        var self = this;
        var y = parseInt(this.start.split("-")[0]);
        var m = parseInt(this.start.split("-")[1]) + 1;
        var d = parseInt(this.start.split("-")[2]);

        //prepare chart data
        var chartData = [];
        _.each(_.keys(self.data), function(k) {
            var y = parseInt(k.split("-")[0]);
            var m = parseInt(k.split("-")[1])-1;
            var d = parseInt(k.split("-")[2]);

            chartData.push([Date.UTC(y, m, d), self.data[k]]);
        });

        this.$el.highcharts({
            chart: {
                type: 'spline'
            },
            title: {
                enabled : false
            },
            subtitle: {
                enabled: false
            },
            legend : {
                enabled : false
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    month: '%e. %b',
                    year: '%b'
                }
            },
            yAxis: {
                title: {
                    text: 'Submission Count'
                },
                min: 0
            },
            tooltip: {
                shared : true
                // formatter: function() {
                //         return '<b>'+ this.series.name +'</b><br/>'+
                //         Highcharts.dateFormat('%e. %b', this.x) +': '+ this.y;
                // }
            },
            
            series: [{
                name: 'Submissions per day for latest 1000 submissions',
                // Define the data points. All series have a dummy year
                // of 1970/71 in order to be compared on the same x axis. Note
                // that in JavaScript, months start at 0 for January, 1 for February etc.
                data: chartData
            }]
        });
        // this.$el.highcharts({
        //     chart: {
        //         zoomType: 'x',
        //         spacingRight: 20
        //     },
        //     title: {
        //         text: 'Submissions per day for latest 1000 submissions'
        //     },
        //     subtitle: {
        //         text: document.ontouchstart === undefined ?
        //             'Click and drag in the plot area to zoom in' :
        //             'Pinch the chart to zoom in'
        //     },
        //     xAxis: {
        //         type: 'datetime',
        //         maxZoom: 14 * 24 * 3600000, // fourteen days
        //         title: {
        //             text: null
        //         }
        //     },
        //     yAxis: {
        //         title: {
        //             text: 'Submission Count'
        //         }
        //     },
        //     tooltip: {
        //         shared: true
        //     },
        //     legend: {
        //         enabled: false
        //     },
        //     plotOptions: {
        //         area: {
        //             fillColor: {
        //                 linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
        //                 stops: [
        //                     [0, Highcharts.getOptions().colors[0]],
        //                     [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
        //                 ]
        //             },
        //             lineWidth: 1,
        //             marker: {
        //                 enabled: false
        //             },
        //             shadow: false,
        //             states: {
        //                 hover: {
        //                     lineWidth: 1
        //                 }
        //             },
        //             threshold: null
        //         }
        //     },
    
        //     series: [{
        //         type: 'area',
        //         name: 'Total',
        //         pointInterval: 24 * 3600 * 1000,
        //         pointStart: Date.UTC(y,m,d),
        //         data: self.data
        //     }]
        // });
    }

});