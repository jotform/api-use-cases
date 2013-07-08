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

        window.app.submissionsCollection.fetch( function (r) {
            for(var i=0; i<r.length; i++) {
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
                    $.magnificPopup.open({
                        items: {
                            src: '<div class="white-popup">Submission with id '+event.id+'</div>', // can be a HTML string, jQuery object, or CSS selector
                            type: 'inline'
                        }
                    });
                }
            });

        }, {filter: {"created_at:gte":date}, limit:1000});   
    }

});
