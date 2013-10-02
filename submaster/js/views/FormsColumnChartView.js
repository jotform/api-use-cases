/**
 * Includes view and events for form list
 */
var FormsColumnChartView = Backbone.View.extend({

    initialize: function(options){

        _.bindAll(this,"render");
        this.el = options.el;
        this.field = options.field;
        this.color = options.color;
        this.render();
    },

    render: function(){

        this.$el.show();
        var self = this;

        var forms = window.app.formsCollection.getForms(this.field, 0, 5)

        console.log("forms", forms);
        
        var values = [];
        for(var i=0; i<forms.length; i++){
            values.push(parseInt(forms[i].get(this.field)));
        }

        var categories = [];
        for(var i=0; i<forms.length; i++){
            categories.push(forms[i].get("title"));
        } 

        this.drawChart(values, categories);
       
    },

    drawChart: function(values, categories){
        var self = this;

        this.$el.highcharts({
            chart: {
                type: 'column',
                height: 100,
                backgroundColor: 'transparent'
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: categories,
                title: {
                    text: null
                },
                labels: {
                    enabled: false
                }
            },
            yAxis: {
                title: {
                    align: 'high',
                    text: null
                },
            },
            tooltip: {
            },
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true
                    },
                    color: self.color
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
                data: values
            }]
        });         
    }

});