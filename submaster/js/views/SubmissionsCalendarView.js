var SubmissionsCalendarView = Backbone.View.extend({

    initialize: function(options) {

        console.log("init calendar");

        this.el = options.el;
        this.formColors = {};
        this.submissionsPerDay = {};

        this.form = options.form || false;
        this.formId = options.formId;
        this.render();

        console.log(this.form);
    },

    render: function() {
        var self = this;

        //get submissions for one month time
        if(this.form) {
            window.app["submissionsCollection" + this.formId] = new FormSubmissionsCollection();

            window.app["submissionsCollection" + this.formId].fetch(this.formId, {limit:1000},
                function success(r) {
                    self.createChartAndCalendar(r);

                }
            );
        } else {
            window.app.submissionsCollection.fetch(
                {
                    // filter: {"created_at:gte":date}, 
                    limit:1000
                }
                , function success(r) {
                    self.createChartAndCalendar(r);

                }
            ); 
        }  
    },

    createChartAndCalendar : function(r) {
        var self = this;

        var d = new Date(),
            y = d.getUTCFullYear(), 
            m = d.getMonth()+"", 
            day = d.getDate();

        function generateRandomColor(){
            var cl = "rgba(";
            var r = _.random(50, 200), g = _.random(50,200), b = _.random(50, 200);

            cl = cl+r+","+g+","+b+","+"0.7)";
            return cl;
        }
        if(m.length === 1) m = "0" + m;

        var date = moment(y+m+day, "YYYY-MM-DD").format("YYYY-MM-DD"),
            events = [];

        //create events data for calendar
        for(var i=0; i<r.length; i++) {
            //create submission map with days
            
            var f = window.app.formsCollection.get(r[i].form_id);
            if(f === undefined) continue;

            var t = window.app.formsCollection.get(r[i].form_id).get("title");
            var ca = r[i].created_at;
            var y = ca.split("-")[0];
            var m = parseInt(ca.split("-")[1]);
            var d = ca.split("-")[2].split(" ")[0];
            var h = ca.split("-")[2].split(" ")[1].split(":")[0];
            
            if(i===r.length-1) {
                self.startDate = y+"-"+m+"-"+d;
            }
            var dateKey = y+"-"+m+"-"+d;

            if(self.submissionsPerDay[dateKey] === undefined) {
                self.submissionsPerDay[dateKey] = 1;
            } else {
                self.submissionsPerDay[dateKey] += 1;
            }

            var c = false;
            if(self.formColors[r[i].form_id] === undefined) {
                c = generateRandomColor();
                self.formColors[r[i].form_id] = c;
            } else {
                c = self.formColors[r[i].form_id];
            }
            events.push({
                title: t,
                start: new Date(y,m-1+"",d, h),
                allDay:false,
                borderColor: c,
                backgroundColor: c,
                id: r[i].id
            });
        }

        var seriesEl = false;
        if(self.form) {
            seriesEl = "#line-" + self.formId;
        } else {
            seriesEl = "#" + "submissions-line"
        }

        new SubmissionsSeriesView({
            data: self.submissionsPerDay,
            start : self.startDate,
            el : seriesEl
        });

        //initialize calendar
        var fc = self.$el.fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,basicWeek,basicDay'
            },
            editable: false,
            disableDragging: true,
            events: events,
            eventClick: function(event, element) {
                var sub = window.app.submissionsCollection.get(event.id).attributes;
                var sv = new SubmissionDetailView({
                    submission: sub
                });
                $.magnificPopup.open({
                    items: {
                        src: sv.el, // can be a HTML string, jQuery object, or CSS selector
                        type: 'inline'
                    }
                });
            }
        });

        var lastSubmission = r[0];
        if(r.length > 0){
            var y = parseInt(lastSubmission.created_at.split("-")[0]);
            var m = parseInt(lastSubmission.created_at.split("-")[1])-1;
            var d = parseInt(lastSubmission.created_at.split("-")[2].split(" ")[0]);
            fc.fullCalendar('gotoDate', y, m, d);
        }

        window.hideLoader();
    }

});
