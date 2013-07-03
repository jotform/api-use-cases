/**
 * Includes view and events for form list
 */
var FormsBarChartView = Backbone.View.extend({

    events: {
        "change #form-chart-options" : "updateChart"
    },
    initialize: function(options){

        _.bindAll(this,"render");
        this.el = options.el;

        //this.collection = new FormsCollection(options.data);

        //this.collection.on("reset", this.render);

        this.template = _.template('<li><%=title%></li>');

        this.render();
    },

    render: function(){

        this.$el.show();
        var self = this;

        var forms = window.app.formsCollection.getForms("new", 0, 5)

        var values = [];
        for(var i=0; i<forms.length; i++){
            values.push(parseInt(forms[i].get("new")));
        }

        var categories = [];
        for(var i=0; i<forms.length; i++){
            categories.push(forms[i].get("title"));
        } 

        this.drawChart(values, categories);
       
    },

    drawChart: function(values, categories){
        var self = this;

        this.$el.find(".widget-content").highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: categories,
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
    },

    updateChart: function(e){
        var self = this;

        var type = $(e.target).val();
        var forms = false;
        var values = [];
        if(type === "most"){
            var forms = window.app.formsCollection.getForms("count", 0, 5)
            for(var i=0; i<forms.length; i++){
                values.push(parseInt(forms[i].get("count")));
            }
        } else {
            var forms = window.app.formsCollection.getForms("new", 0, 5);
            for(var i=0; i<forms.length; i++){
                values.push(parseInt(forms[i].get("new")));
            }            
        }

        var categories = [];
        for(var i=0; i<forms.length; i++){
            categories.push(forms[i].get("title"));
        } 
               
        this.drawChart(values, categories);     

        //this.drawChart();
    }

});