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
        this.renderDatePicker();
        this.renderFormQuestions();
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

    },

    renderDatePicker : function () {
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
                $('.grid-date-picker-toggle > span', self.el).html(formated.join(' - '));
            }
        });
        var state = false;
        $('.grid-date-picker-toggle > a', this.el).bind('click', function(){
            $('.grid-date-picker', self.el).stop().animate({height: state ? 0 : $('.grid-date-picker div.datepicker', self.el).get(0).offsetHeight}, 500, function(){
                
            });
            state = !state;
            return false;
        });
       
    },

    renderFormQuestions: function () {
        var self = this;
        var state = false;
        $('.grid-form-questions-toggle', this.el).bind('click', function(){
            $('.grid-form-questions', self.el).stop().animate({height: state ? 0 : 200}, 500, function(){
                
            });
            state = !state;
            return false;
        });        
        JF.getFormQuestions(this.formModel.id, function(r){
            for(var key in r){
                var value = r[key];
                if(value.type !== 'control_button') {
                    $(".grid-form-questions-list", self.el).append('<li>' +
                            '<input type="checkbox" data-qid="'+value.qid+'" />' + '<span>'+value.text+'</span>' +
                        '</li>');
                }
            }
        });
    }

});