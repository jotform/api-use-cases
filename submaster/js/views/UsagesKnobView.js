var UsagesKnobView = Backbone.View.extend({

    initialize: function(options){
        this.el = options.el;
        this.usage = options.usage;
        this.render();
    },

    render: function(){
        var self = this;
        $.ajax({
            url: window.app.user.account_type,
            dataType: 'json',
            success: function(r){
                window.app.limits = r.content.limits;
                // self.drawKnob($("#submission", self.el), r.content.limits.submissions, self.usage.submissions, "#FF0000");
                // self.drawKnob($("#sslsubmission", self.el), r.content.limits.sslSubmissions, self.usage.ssl_submissions, "#FF0000");
                // self.drawKnob($("#payment", self.el), r.content.limits.payments, self.usage.payments, "#FF0000");
                // self.drawKnob($("#upload", self.el), r.content.limits.uploads, self.usage.uploads, "#FF0000");
                self.drawKnob($("#submission", self.el), 100, 40, "#FF0000");
                self.drawKnob($("#sslsubmission", self.el), 10, 8, "#FF0000");
                self.drawKnob($("#payment", self.el), 10, 2, "#FF0000");
                self.drawKnob($("#upload", self.el), 1000, 550, "#FF0000");  
                // var $topLoader = $("#submissions").percentageLoader({width: 126, height: 126, controllable : true, progress : 0.8, onProgressUpdate : function(val) {
                //   $topLoader.setValue(Math.round(val * 100.0));
                // }}); 
                // $topLoader.setValue('0');             
                self.$el.show();
            }

        });
    },

    drawKnob: function(elem, max, value, fgColor){

        var ratio = value / max, color;
        if(ratio<= 0.25) {
            color = '#64D764';
        } else if ( ratio > 0.25 && ratio <= 0.5 ) {
            color= '#B0C8C8';
        } else if ( ratio > 0.50 && ratio <= 0.75 ) {
            color = '#D7CD64';
        } else if ( ratio > 0.75) {
            color = '#D76E62';
        }

        elem.val(value);
        elem.attr("data-fgcolor", color);

        elem.knob({
                min: 0,
                max: max,
                draw : function () {
                    // "tron" case
                    if(this.$.data('skin') == 'tron') {

                        var a = this.angle(this.cv)  // Angle
                            , sa = this.startAngle          // Previous start angle
                            , sat = this.startAngle         // Start angle
                            , ea                            // Previous end angle
                            , eat = sat + a                 // End angle
                            , r = true;

                        this.g.lineWidth = this.lineWidth;

                        this.o.cursor
                            && (sat = eat - 0.3)
                            && (eat = eat + 0.3);

                        if (this.o.displayPrevious) {
                            ea = this.startAngle + this.angle(this.value);
                            this.o.cursor
                                && (sa = ea - 0.3)
                                && (ea = ea + 0.3);
                            this.g.beginPath();
                            this.g.strokeStyle = this.previousColor;
                            this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
                            this.g.stroke();
                        }

                        this.g.beginPath();
                        this.g.strokeStyle = r ? this.o.fgColor : this.fgColor ;
                        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
                        this.g.stroke();

                        this.g.lineWidth = 2;
                        this.g.beginPath();
                        this.g.strokeStyle = this.o.fgColor;
                        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
                        this.g.stroke();

                        return false;
                    }
                },
                change: function () {
                    return false;
                }
               
        })
    }

});