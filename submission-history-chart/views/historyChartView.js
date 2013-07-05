var HistoryChartView = Backbone.View.extend({
    el: "#historyChart",
    events:
    {
        'click #getFormSubmissions': 'getFormSubmissionsEvt',
        'change #userFormsList' : 'getFormSubmissionsEvt',
        'click #allDates': 'getFromAllDates'
    },
    /**
     * Constructor
     */
    initialize: function()
    {
        //initialize app name
        JF.initialize({ appName: "Submissions-Chart" });

        //build chart data object
        this._chartData = {
            chart: null,
            totalSubmissions: 0,
            formSubmissionsTemp: {},
            enableCacheSubmissions: true,
            dataTableObj: new google.visualization.DataTable()
        };

        //elements data object
        this._elem = {
            mainContainer_el: $("#mainContent"),    //mainContent
            formSelected_el: $("#userFormsList"),   //list of forms
            chartType_el: $("#chartType"),          //chart element
            rangeFrom_el: $("#date-input-1"),       //range From elem
            rangeTo_el: $("#date-input-2"),         //range To elem
            allDates_el: $("#allDates")             //all dates elem
        };

        _.bindAll(this, 
            "setDefaults", "getUserForms", "getFormSubmissionsEvt", "getFromAllDates",
            "getOnlyDate", "setChartType", "getTimeRange", "getTimeStamp", "sortArray",
            "objectToDataTable", "buildChart", "processChartForm", "getFormSubmissions");

        this.setDefaults();
    },

    setDefaults: function()
    {
        var self = this;

        //get user forms automatically
        self.getUserForms();

        //set default time range
        self.setDefaultTimeRange();

        //set google chart defaults
        self.chartDivElement = "chart_div";
        self._elem.chart_el = document.getElementById(self.chartDivElement);
        self._chartData.chart = new google.visualization.AreaChart( self._elem.chart_el );

        self.column1Title = "Date";
        self.column2Title = "Submission Counts";

        //default columns
        self._chartData.dataTableObj.addColumn('date', self.column1Title);
        self._chartData.dataTableObj.addColumn('number', self.column2Title);

        //horizontal Axis options
        self.hAxisOptions = {
            title: "Submission Date",
            titleTextStyle: {color: 'red'},
            gridlines: {color: '#ccc', count: 10},
            minorGridlines: {color: '#eee', count: 3}
        };

        //vertical Axis options
        self.vAxisOptions = {
            title: "Submissions Count",
            titleTextStyle: {color: 'red'},
            gridlines: {color: '#eee', count: 20}
        };

        //main options of the chart
        self.mainOptions = {
            animation: {
                duration: 500,
                easing: 'out'
            },
            legend: {
                position: 'bottom',
                alignment: 'end'
            },
            pointSize: 5,
            vAxis: self.vAxisOptions,
            hAxis: self.hAxisOptions,
            slantedText: true,
            chartArea: {
                left: 150,
                top: 100
            }
        };
    },

    /**
     * Show laoding indicator
     */
    showStart: function( elemObj )
    {
        var elem = elemObj || $('#chartContainer');
        elem.showLoading();
    },

    /**
     * Hide loading indicator
     */
    showEnd: function( elemObj )
    {
        var elem = elemObj || $('#chartContainer');
        elem.hideLoading();
    },

    /**
     * Get all the users form
     */
    getUserForms: function()
    {
        var self = this;

        //display loading indicator to main content
        self.showStart( self._elem.mainContainer_el );

        JF.getForms(function(e){
            var opt = "";
            for ( var i in e )
            {
                var value = e[i].id;
                var text = e[i].title;
                opt += "<option value=\""+value+"\">"+text+"</option>\n";
            }

            $("#userFormsList").html(opt);

            //clean loading from main content
            self.showEnd( self._elem.mainContainer_el );
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

        //show loading indicator
        self.showStart();

        //get data from cache if any to lessen load times
        if ( self._chartData.enableCacheSubmissions && self._chartData.formSubmissionsTemp[ formID ] )
        {
            // console.log('from cache');
            getData(self, self._chartData.formSubmissionsTemp[ formID ], next);
        }
        else
        {
            // console.log('from request');
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
     * Alternative way to fetch data from the server
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

    /**
     * Set the default range for the calendar pickers
     */
    setDefaultTimeRange: function()
    {
        //modify default ranges and set them as calendarview
        var l = this.getLastWeek();
        this._elem.rangeFrom_el.val( l.lastWeekFull ).removeAttr('disabled').calendar({dateFormat: '%m/%d/%Y', defaultDate: l.lastWeekFull });
        
        this._elem.rangeTo_el.val( l.todayFull ).removeAttr('disabled').calendar({dateFormat: '%m/%d/%Y', defaultDate: l.todayFull });
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
     * Get the proper date format
     * and return it such as January 1, 2013
     */
    getDateFromString: function( date )
    {
        var MONTHS = ["January","Februry","March","April","May","June","July","August","September","October","November","December"];
        var myDate, myFormatDate;
        var d = new Date( date );
        var date_str =( d.getMonth() + 1 ) + "/" + d.getDate() + "/" + d.getFullYear();
        var t = date_str.split("/");
        if ( t[2] )
        {
            myDate = new Date(t[2], t[0] - 1, t[1]);
            myFormatDate = MONTHS[myDate.getMonth()] + " " + myDate.getDate() + "," + myDate.getFullYear();
        }
        else
        {
            myDate = new Date(new Date().getFullYear(), t[0] - 1, t[1]);
            myFormatDate = MONTHS[myDate.getMonth()] + " " + mydate.getDate();
        }

        return myFormatDate;
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
        var fromRText = ( this._chartData.totalSubmissions ) ? this.getDateFromString( this._chartData.dataTable[0] ) : "N/A";
        var fromTText = ( this._chartData.totalSubmissions && this._chartData.totalSubmissions > 1 ) ? this.getDateFromString( this._chartData.dataTable[ this._chartData.dataTable.length - 1 ] ) : "N/A";
        var totalCounts = {
            from: ( this._chartData.totalSubmissions && this._chartData.totalSubmissions > 1 && this._chartData.rangeFromRAW ) ? this._chartData.rangeFromRAW : fromRText,
            to: ( this._chartData.totalSubmissions && this._chartData.totalSubmissions > 1 &&  this._chartData.rangeToRAW ) ?  this._chartData.rangeToRAW : fromTText,
            total: ( this._chartData.totalSubmissions ) ? this._chartData.totalSubmissions : "N/A"
        };

        var maxSubmission = {
            date: "N/A",
            value: "N/A"
        };

        //if max submission oject is present createad from buildChart()
        if ( this._chartData.maxSubmissionsRowIndex !== undefined )
        {
            //since date column index in datatable is 0 and value as 1
            var dateColumnIndex = 0;
            var valueColumnIndex = 1;
            var rowIndex = this._chartData.maxSubmissionsRowIndex;
            var dataTable = this._chartData.dataTableObj;

            maxSubmission.date = this.getDateFromString( dataTable.getValue( rowIndex, dateColumnIndex) );
            maxSubmission.value = dataTable.getValue( rowIndex, valueColumnIndex);

            console.log("max", maxSubmission);
        }


        var totalsElem = $("#totalSubmission");

        //set values
        $('.highestCounts', totalsElem).text( maxSubmission.value );
        $('._highestCountDate', totalsElem).text( maxSubmission.date )

        $('.totalCounts', totalsElem).text( totalCounts.total );
        $('._fromRange', totalsElem).text( totalCounts.from );
        $('._toRange', totalsElem).text( totalCounts.to );

        totalsElem.show();
    },

    /**
     * Build the whole chart
     */
    buildChart: function()
    {
        var self = this;

        // //clear any previous chart resources
        // if ( self._chartData.chart )
        // {
        //     self.clearChart();
        // }

        //since we are using one data table, we need to delete the old one and set another
        if ( typeof self._chartData.dataTableObj !== "undefined" )
        {
            //get the total rows of all the data table
            var currentDataTableRowCount = self._chartData.dataTableObj.getNumberOfRows();
            console.log("currentDataTableRowCount", currentDataTableRowCount);

            //if rows are greater than zero, meaning we do have current data on the dataTable
            if ( currentDataTableRowCount > 0 )
            {
                //get the total rows of the current data table
                var currentDataTableCount = self._chartData.dataTable.length;
                console.log("currentDataTableCount", currentDataTableCount);
                //get the index to start removing rows
                //if and only if currentDataTableRowCount > currentDataTableCount
                if ( currentDataTableRowCount > currentDataTableCount )
                {
                    var deepIndex = currentDataTableCount;
                    var totalRowToRemove = ( currentDataTableRowCount - deepIndex );
                    console.log("deepIndex totalRowToRemove", deepIndex,totalRowToRemove);

                    self._chartData.dataTableObj.removeRows( deepIndex, totalRowToRemove);
                }
                else
                {
                    console.log("second");
                    var totalRowToAdd = ( currentDataTableCount - currentDataTableRowCount );
                    console.log("totalRowToAdd", totalRowToAdd);
                    self._chartData.dataTableObj.addRows(totalRowToAdd);
                }

                var z = self._chartData.dataTable;
                for( var x = 0; x < z.length; x++ )
                {
                    console.log( z[x]);
                    console.log(x, 0, new Date(z[x][0]));
                    console.log(x, 1, z[x][1]);

                    //set date
                    self._chartData.dataTableObj.setValue(x, 0, new Date(z[x][0]));

                    //set value
                    self._chartData.dataTableObj.setValue(x, 1, z[x][1]);
                }
            }
            else
            {
                //add some data to the data table
                self._chartData.dataTableObj.addRows(self._chartData.dataTable);
            }
        }

        //get max submissions index array
        var columnIndex = 1;
        var maxSubmissionRowIndex = self._chartData.dataTableObj.getFilteredRows([{
            column: columnIndex,
            value: self._chartData.dataTableObj.getColumnRange( columnIndex ).max
        }])[0];

        //register to global object
        self._chartData.maxSubmissionsRowIndex = maxSubmissionRowIndex;

        //build dataView
        // var dataView = new google.visualization.DataView(self._chartData.dataTableObj);
        //     dataView.setColumns([{
        //         calc: function(data, row) {
        //             return data.getFormattedValue(row, 0);
        //         },
        //         type:'string'
        //     },  1 ]);

        //event when chart is ready
        google.visualization.events.addListener(self._chartData.chart, 'ready', function(){
            console.log("chart is now ready: total submissions", self._chartData.totalSubmissions);
            self.showEnd();
            console.log( self.mainOptions );
            self.showTotalSubmissions();
        });

        self._chartData.chart.draw(self._chartData.dataTableObj, self.mainOptions);
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

        self.mainOptions.title = "Submission Chart History for - " + self.formTitle;

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

        //set chart type, default range elems and then process now the chartform
        this.setChartType( this._elem.chartType_el ).getTimeRange( this._elem.rangeFrom_el, this._elem.rangeTo_el ).processChartForm( this._elem.formSelected_el );

        return false;
    },

    /**
     * Get and display all submissions from all the dates
     */
    getFromAllDates: function()
    {
        if ( this._elem.allDates_el.is(":checked") )
        {
            console.log("all dates was checked");
            this._elem.rangeFrom_el.val('').attr('disabled', true);
            this._elem.rangeTo_el.val('').attr('disabled', true);

        }
        else
        {
            console.log("all dates not set");
            this.setDefaultTimeRange();
        }

        //reset chart if present
        if ( typeof this._chartData.chart !== "undefined" )
        {
            this.getFormSubmissionsEvt();
        }
    }

});