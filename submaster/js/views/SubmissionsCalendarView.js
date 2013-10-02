var SubmissionsCalendarView = Backbone.View.extend({

    initialize: function(options) {
        this.el = options.el;
        this.formColors = {};
        this.render();
    },

    render: function() {
        var self = this;

        //get submissions for one month time
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

        console.log(date);
        window.app.submissionsCollection.fetch(
            {
                // filter: {"created_at:gte":date}, 
                limit:1000
            }
            , function (r) {

                console.log("submission data for calendar fetched", r);

                //create events data for calendar
                for(var i=0; i<r.length; i++) {
                    var f = window.app.formsCollection.get(r[i].form_id);
                    if(f === undefined) continue;

                    var t = window.app.formsCollection.get(r[i].form_id).get("title");
                    var ca = r[i].created_at;
                    var y = ca.split("-")[0];
                    var m = parseInt(ca.split("-")[1]);
                    var d = ca.split("-")[2].split(" ")[0];
                    var h = ca.split("-")[2].split(" ")[1].split(":")[0];
                    
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

                //initialize calendar
                self.$el.fullCalendar({
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
                        console.log(element);
                        $.magnificPopup.open({
                            items: {
                                src: sv.el, // can be a HTML string, jQuery object, or CSS selector
                                type: 'inline'
                            }
                        });
                    }
                });
            }
        );   
    }

});
