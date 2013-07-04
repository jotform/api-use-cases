var HistoryChartView = Backbone.View.extend({
    el: "#historyChart",
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
            "getOnlyDate", "setChartType", "getTimeRange",
            "getTimeStamp", "sortArray", "objectToDataTable",
            "buildChart", "processChartForm", "getFormSubmissions"
        );

        this.render();
    },

    render: function()
    {
        // console.log('testing view');

        //initialize app name
        JF.initialize({ appName: "Submissions-Chart" });

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
                opt += "<option value=\""+value+"\">"+text+"</option>\n";
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
            var dataFormatted = {};

            for( var i in a )
            {
                var data = a[i];
                var created_date = data.created_at;
                var onlyDate = self.getOnlyDate( created_date );

                //count how many submissions each date
                dataFormatted[onlyDate] = ( dataFormatted.hasOwnProperty( onlyDate ) ) ? dataFormatted[onlyDate]+1 : 1;
            }

            //call callback(instance, formatted array data, all objects)
            next.call(self, dataFormatted, a);
        };

        self.showStart();

        //get data from cache if any to lessen load times
        if ( self._chartData.enableCacheSubmissions && self._chartData.formSubmissionsTemp[ formID ] )
        {
            console.log('from cache');
            getData(self, self._chartData.formSubmissionsTemp[ formID ], next);
        }
        else
        {
            console.log('from request');
            this.getFormSubmissionsAJAX(formID, function(a){
                console.log(a);
                self._chartData.formSubmissionsTemp[ formID ] = a;
                getData( self, self._chartData.formSubmissionsTemp[ formID ], next );
            }, {
                offset: 0,
                limit: 1000
            });
            // JF.getFormSubmissions(formID, function(a){
            //     self._chartData.formSubmissionsTemp[ formID ] = a;
            //     getData(self, self._chartData.formSubmissionsTemp[ formID ], next);
            // });
        }
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
     * Extract the MM/DD/YYYY from a date string
     * such as MM-DD-YYYY HH:MM:SS
     * @param date - date string on where to extract
     */
    getOnlyDate: function( date )
    {
        var d = date.split(" ")[0];
        var a = d.split('-');
        return a[1]+'/'+a[2]+'/'+a[0];
    },

    /**
     * Set what chart is going to use
     * @param charElem - element that contains what chart is going to use
     */
    setChartType: function( chartElem )
    {
        var chartText = chartElem.text();

        this._chartData.chartType = chartElem.val();

        return this;
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
    },

    /**
     * Sort an array by date
     */
    sortArray: function( a, b )
    {
        a = new Date( a[ 0 ] );
        b = new Date( b [ 0 ] );
        return ( a < b ) ? -1 : ( ( a > b ) ? 1 : 0 );
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
            var key = i;
            // console.log(key);
            var value = object[i];

            var thisKeyTime = this.getTimeStamp( key );
            if ( ( !this._chartData.rangeFrom || !this._chartData.rangeTo ) || (thisKeyTime >= this._chartData.rangeFrom && thisKeyTime <= this._chartData.rangeTo) )
            {
                array.push([ new Date(key), value]);

                //get the total submissions
                this._chartData.totalSubmissions += value;
            }
        }

        this._chartData.dataTable = array.sort(this.sortArray);

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
            dataTable.addColumn('date', self.column1Title);
            dataTable.addColumn('number', self.column2Title);
            dataTable.addRows(self._chartData.dataTable);

        var dataView = new google.visualization.DataView(dataTable);
            dataView.setColumns([{
                calc: function(data, row) {
                    return data.getFormattedValue(row, 0);
                },
                type:'string'
            },  1 ]);

        var chartElem = document.getElementById(self.chartDivElement);
        var chartOpt = self.mainOptions;

        switch( self._chartData.chartType )
        {
            case 'barChart':
                self._chartData.chart = new google.visualization.ColumnChart( chartElem );
            break;
            case 'lineChart':
                self._chartData.chart = new google.visualization.LineChart( chartElem );
            break;
            case 'areaChart':
                self._chartData.chart = new google.visualization.AreaChart( chartElem );
            break;
            case 'pieChart':
                self._chartData.chart = new google.visualization.PieChart( chartElem );
            break;
        }

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
        self.column1Title = "Date";
        self.column2Title = "Submission Counts";

        self.chartTitle = "Submission Chart History for - " + self.formTitle;

        self.hAxisOptions = {
            title: "Submission Date",
            titleTextStyle: {color: 'red'},
            showTextEvery: 5
        };

        self.vAxisOptions = {
            title: "Submissions Count",
            titleTextStyle: {color: 'red'},
            gridlines: {color: '#eee', count: 20},
        };

        //main options of the chart
        self.mainOptions = {
            height: 500,
            animation: {
                duration: 1000,
                easing: 'inAndOut'
            },
            legend: {
                position: 'bottom',
                alignment: 'end'
            },
            pointSize: 5,
            title: self.chartTitle,
            vAxis: self.vAxisOptions,
            hAxis: self.hAxisOptions,
            slantedText: true,
            chartArea: {
                left: 100,
                top: 50,
                width: "85%"
            }
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
        this.setChartType( this._elem.chart_el ).getTimeRange( this._elem.rangeFrom_el, this._elem.rangeTo_el ).processChartForm( this._elem.formSelected_el );

        return false;
    }

});