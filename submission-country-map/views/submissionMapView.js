var submissionMapView = Backbone.View.extend({
    el: "#submissionMap",
    events:
    {
        'click #getFormSubmissions': 'getFormSubmissionsEvt',
    },
    /**
     * Constructor
     */
    initialize: function()
    {
        this._chartData = {
            chart: null,
            totalSubmissions: 0,
            formSubmissionsTemp: {},
            enableCacheSubmissions: true
        };

        this._elem = {
            formSelected_el: $("#userFormsList"),   //list of forms
            chart_el: $("#chartType"),              //chart element
            rangeFrom_el: $("#date-input-1"),       //range From elem
            rangeTo_el: $("#date-input-2"),         //range To elem
        }

        _.bindAll(this,
            "render", "getUserForms", "getFormSubmissions",
            "getTimeRange","getTimeStamp","objectToDataTable",
            "buildChart", "processChartForm", "getFormSubmissions"
        );

        this.render();
    },

    render: function()
    {
        // console.log('testing view');

        //initialize app name
        JF.initialize({ appName: "Submissions-Map" });

        //get user forms automatically
        this.getUserForms();

        //set default time range
        this.setDefaultTimeRange();
    },

    showStart: function()
    {
        console.log("please wait");
    },

    showEnd: function()
    {
        console.log('done');
    },

    /**
     * Get all the users form
     */
    getUserForms: function()
    {
        JF.getForms(function(e){
            var opt = "";
            for ( var i in e )
            {
                var value = e[i].id;
                var text = e[i].title;
                opt += "<option value=\""+value+"\">"+text+ " - " + e[i].count + "</option>\n";
            }

            $("#userFormsList").html(opt);
        });
    },

    /**
     * Get all submission from an specific form
     * @param formID - the form ID on where to get all forms
     * @param next - callback after all forms has been fetched
     */
    getFormSubmissions: function( formID, next )
    {
        var self = this;
        var getData = function(self, a, next)
        {
            var array = new Object();
            var arrayData = [];
            var length = a.length;
            var counter = 0;
            for( var i in a )
            {
                var data = a[i];
                var ip = data.ip;
                $.getJSON("http://freegeoip.net/json/" + ip, function(response)
                    {
                        counter ++;
                        if (!array[response.country_code])
                        {
                            array[response.country_code] = new Object();
                        }
                        array[response.country_code][response.city] = (array[response.country_code][response.city]) ? array[response.country_code][response.city] + 1 : 1 ;
                        console.log ( counter + " of " + length);
                        if (counter == length) {
                            next.call(self, array, a);
                        }
                    });
                //count how many submissions each date
                //array[onlyDate] = ( dataFormatted.hasOwnProperty( onlyDate ) ) ? dataFormatted[onlyDate]+1 : 1;
            }

            //call callback(instance, formatted array data, all objects)
            
        };

        self.showStart();

        console.log('from request');
        this.getFormSubmissionsAJAX(formID, function(a){
            console.log(a);
            self._chartData.formSubmissionsTemp[ formID ] = a;
            getData( self, self._chartData.formSubmissionsTemp[ formID ], next );
        }, {
            offset: 0,
            limit: 1000
        });
    },

    /**
     * Alternative way to fetch data from teh server
     */
    getFormSubmissionsAJAX: function( formID, next, query )
    {
        var offset = "",
            limit = "",
            orderBy = "",
            orderType = "",
            self = this;

        //if query object existed
        if ( query && typeof query === 'object' )
        {
            offset = ( query.offset ) ? "&offset=" + query.offset : "";
            limit = ( query.limit ) ? "&limit=" + query.limit : "";
            orderBy = ( query.orderBy ) ? "&orderBy=" + query.orderBy: "";
            if ( query.orderType && ( query.orderType === 'ASC' || query.orderType === 'DESC' ) )
            {
                orderType =  ( query.orderType ) ? "." + query.orderType : "";
            }
        }

        var apiKey = JF.getAPIKey();
        var url = "http://api.jotform.com/form/"+formID+"/submissions?apiKey="+apiKey + offset + limit + orderBy + orderType;
        $.getJSON(url, function(response){
            next.call(self, response.content);
        });
    },

    /**
     * Convert object response from getting the form submissions
     * to a dataTable that is compatible with Google Chart API
     * @param object - the object to convert
     */
    objectToDataTable: function( object )
    {
        var array = [];

        for( var i in object )
        {
            if (Object.keys(object).length == 1) this.region = i;
            var country = i;
            var cityObject = object[i];
            for( var city in cityObject )
            {
                var count = cityObject[city];
                array.push([ country, city, count]);
                //get the total submissions
                this._chartData.totalSubmissions += count;
            }
                    
        }

        this._chartData.dataTable = array;

        return this;
    },

    /**
     * Show the total submissions count to the page
     */
    showTotalSubmissions: function()
    {
        var strRangeFrom = ( this._chartData.rangeFromRAW ) ? "From <span class='totals'>" + this._chartData.rangeFromRAW + "</span>" : "";
        var strRangeTo = ( this._chartData.rangeToRAW ) ? " - <span class='totals'>" + this._chartData.rangeToRAW + "</span> : " : "";

        var total = ( this._chartData.totalSubmissions ) ? this._chartData.totalSubmissions : "N/A";

        $("#totalSubmission span").html( strRangeFrom + strRangeTo + total ).parent().show();
    },

    /**
     * Build the whole chart
     */
    buildChart: function()
    {
        var self = this;
        var dataTable = new google.visualization.DataTable();
            dataTable.addColumn('string','Country');
            dataTable.addColumn('string','City');
            dataTable.addColumn('number','Submission Count');
            dataTable.addRows(self._chartData.dataTable);
        var chartOpt = self.mainOptions;
        if (this.region)
        {
            dataTable.removeColumn(0);
            //chartOpt['colors'] = [0xFF8747, 0xFFB581, 0xc06000];
            chartOpt['region'] = this.region;
            chartOpt['resolution'] = 'provinces';
            chartOpt['displayMode'] = 'regions';
        } 
        var dataView = new google.visualization.DataView(dataTable);
        var chartElem = document.getElementById(self.chartDivElement);

        self._chartData.chart = new google.visualization.GeoChart( chartElem );

        //event when chart is ready
        google.visualization.events.addListener(self._chartData.chart, 'ready', function(){
            console.log("chart is now ready: total submissions", self._chartData.totalSubmissions);
            self.showEnd();
            console.log( chartOpt );
            self.showTotalSubmissions();
        });

        self._chartData.chart.draw(dataView, chartOpt);
    },

    /**
     * Clears the chart, and releases all of its allocated resources.
     */
    clearChart: function()
    {
        this._chartData.chart.clearChart();
        this.region = null;
    },

    /**
     * Proccesor of the form, setting default values and get all forms
     */
    processChartForm: function( elem )
    {
        var self = this;
        var formElem = elem.find(":selected");

        self.formID = formElem.val();
        self.formTitle = formElem.text();

        self.chartDivElement = "chart_div";

        self.chartTitle = "Submission Map for - " + self.formTitle;

        //main options of the chart
        self.mainOptions = {
            colorAxis: {minValue: 0,  colors: ['#F5F5F5', '#10A212']},
            //backgroundColor: {stroke: '#000',strokeWidth: 12},
            magnifyingGlass: {enable: true, zoomFactor: 15.0},
            height: 500,
            width: 600,
            legend: {
                position: 'bottom',
                alignment: 'end'
            },
            title: self.chartTitle,
        };

        //reset total submission
        this._chartData.totalSubmissions = 0;

        var dataObj = this.getFormSubmissions( self.formID, function(e){
            self.objectToDataTable( e ).buildChart();
        });

        return this;
    },

    /**
     * Function event when the form submission is clicked
     */
    getFormSubmissionsEvt: function()
    {
        console.log('getFormSubmissions clicked');

        if ( this._chartData.chart )
        {
            this.clearChart();
        }

        //set chart type, default range elems and then process now the chartform
        this.getTimeRange( this._elem.rangeFrom_el, this._elem.rangeTo_el ).processChartForm( this._elem.formSelected_el );

        return false;
    },

    setDefaultTimeRange: function()
    {
        var rangeFrom = this._elem.rangeFrom_el;
        var rangeTo =  this._elem.rangeTo_el;

        //modify default ranges and set them as calendarview
        var l = this.getLastWeek();
        console.log(l);
        rangeFrom.val( l.lastWeekFull ).calendar({dateFormat: '%o/%e/%Y', defaultDate: l.lastWeekFull });
        rangeTo.val( l.todayFull ).calendar({dateFormat: '%o/%e/%Y', defaultDate: l.todayFull });
    },

    /**
     * Set the time range on what to fetch from submissions
     * @param range1 - element that contains the rangeFrom
     * @param range2 - element that contains the rangeTo
     */
    getTimeRange: function( range1, range2 )
    {
        this._chartData.rangeFromRAW = range1.val();
        this._chartData.rangeToRAW = range2.val();
        this._chartData.rangeFrom = this.getTimeStamp( this._chartData.rangeFromRAW  );
        this._chartData.rangeTo = this.getTimeStamp( this._chartData.rangeToRAW );

        return this;
    },

    /**
     * Get last week date
     * such as MM/DD/YYYY
     */
    getLastWeek: function()
    {
        var t = new Date();
        var l = new Date( t.getFullYear(), t.getMonth(), t.getDate() - 7 );

        return {
            lastWeekMonth: l.getMonth() + 1,
            lastWeekDay: l.getDate(),
            lastWeekYear: l.getFullYear(),
            lastWeekFull: ( l.getMonth() + 1 ) + "/" + l.getDate() + "/" + l.getFullYear(),
            todayFull : ( t.getMonth() + 1 ) + "/" + t.getDate() + "/" + t.getFullYear()
        };
    },

    /**
     * Get the unix time equivalent of human readable time string format
     * such as mm-dd-yy
     */
    getTimeStamp: function ( time )
    {
        return new Date( time ).getTime() / 1000;
    }

});