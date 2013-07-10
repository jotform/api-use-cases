var FormSubmissionsGridView = Backbone.View.extend({

    initialize : function (options) {
        this.el = options.el;
        this.formModel = options.formModel;
        window.app.stateModel.set(this.formModel.id, true);

        var defaltQuery = {
            offset: 0,
            limit: 20,
            orderBy: undefined,
            filter: undefined,
            direction: undefined
        }

        this.queryModel = new Backbone.Model();
        this.render();
    },

    render : function () {
        this.renderToolbar();
        this.renderGrid();
        this.renderBottomToolbar();
    },

    renderToolbar : function () {
        var self = this;
        //build datepicker
        var now3 = new Date();
        now3.addDays(-4);
        var now4 = new Date();
        this.$el.find(".grid-date-picker").DatePicker({
            flat: true,
            format: 'd B, Y',
            date: [new Date(now3), new Date(now4)],
            calendars: 3,
            mode: 'range',
            starts: 1,
            onChange: function(formated) {
                console.log(formated);
                //$('#widgetField span').get(0).innerHTML = formated.join(' &divide; ');
            }
        });
        var state = false;
        $('.grid-date-field>a', this.el).bind('click', function(){
            // $('.grid-date-picker', self.el).stop().animate({height: state ? 0 : $('.grid-date-picker div.datepicker', self.el).get(0).offsetHeight}, 500);
            // state = !state;
            // return false;
            $('.grid-date-picker', self.el).toggle();
            return false;
        });
        //$('.grid-date-picker div.datepicker', this.el).css('position', 'absolute');        
        this.renderQuestionsDropdown();
    },

    renderBottomToolbar : function () {

    },

    renderQuestionsDropdown : function () {

    },

    renderGrid : function () {
        this.renderGridHead();
        this.renderGridBody();
    },

    renderGridHead : function () {

    },

    renderGridBody : function () {

    }

});