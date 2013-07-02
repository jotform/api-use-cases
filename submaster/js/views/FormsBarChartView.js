/**
 * Includes view and events for form list
 */
var FormsBarChartView = Backbone.View.extend({

    initialize: function(options){

        _.bindAll(this,"render");
        this.el = options.el;

        this.collection = new FormsCollection(options.data);

        this.collection.on("reset", this.render);

        this.template = _.template('<li><%=title%></li>');

        this.render();
    },

    render: function(){

        this.$el.show();
        var self = this;

        var values = [];
        this.collection.each(function(el){
            values.push(parseInt(el.get("new")));
        });
        this.$el.highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: self.collection.pluck("title"),
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Unread Submissions',
                //data: [90, 70, 30, 10, 20]
                data: values
            }]
        });        
    }

});