var FormSubmissionsGridView = Backbone.View.extend({
    initialize : function (options) {
        this.el = options.el;
        this.formModel = options.formModel;
        window.app.stateModel.set(this.formModel.id, true);
        var defaultQuery = {
            status: 0,
            offset: 0,
            limit: 20,
            orderBy: undefined,
            filter: undefined,
            direction: undefined,
            columns: undefined
        }

        this.queryModel = new Backbone.Model(defaultQuery);
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
    /**/
      $('.grid-content-table thead th', this.el).remove();
        var self = this;
        this.selectedQuestions = new Array();
        this.selectedQuestions = [];
        var i = $('.grid-form-questions-list', self.el).find('input:checked');
         $('.grid-content-table thead', self.el).hide();
        var j = $('.grid-form-questions-list ', self.el).find('input:checked').each(function(idx, el){
            self.selectedQuestions.push($(el).attr('data-qid'))
            $('.grid-content-table thead', self.el).append('<th data-qid="'+
                $(el).attr('data-qid')+'">' + $(el).next().html() +
                '</th>');
        });
    /**/
    },

    renderGrid : function () {
        this.renderGridHead();
        this.renderGridBody();
    },

    renderGridHead : function () {

    },

    renderGridBody : function () {
        /**/
        var self = this;
        $('.grid-content-table tbody td', this.el).remove();
        $('.grid-content-table tbody tr', this.el).remove();
        var queryString;
        var ree = 0;
        var questionList = new Array();
        questionList = [];
        var query = this.queryModel.attributes;
        var currentDate = moment().format("YYYY-MM-DD");
        var jsonObj, jsonString;
        if (query.status == 0) {
            if($('#unread-flag').attr('checked', true))
                console.log("cehecjed");
            var defaultDate = moment(currentDate).subtract("days", 17).format("YYYY-MM-DD");
            jsonString = '{"filter":{"created_at:gt" : "' + defaultDate + '"}}';
            queryString = JSON.parse(jsonString);
        } else {
            var dateString = [];
            dateString = query.filter.split('-');
            var startDate = moment(dateString[0]).format('YYYY-MM-DD');
            var endDate = moment(dateString[1]).format('YYYY-MM-DD');
            if (startDate == endDate){
                jsonString = '{"filter":{"created_at" : "' + startDate + '"}}';
                queryString = JSON.parse(jsonString);
            } else {
                jsonString = '{"filter":{"created_at:gt" : "' + startDate + '", "created_at:lt" : "' + endDate + '"}}';
                queryString = JSON.parse(jsonString);

            }
        }

        window.app.formSubmissionsCollection.fetch(function(r){
            for (var i = 0 ; i < r.length; i++) {
                var answerList = new Array();
                $('.grid-content-table tbody', self.el).append('<tr>')

                if(r[i].id !='#SampleSubmissionID'){
                    $('.grid-content-table thead', self.el).show();
                    $('.grid-content-table', self.el).show();
                    $('.grid-content-span',self.el).hide();
                        if (_.contains(self.selectedQuestions,'ip')) { 
                            answerList.push(r[i].ip);
                        }
                        if (_.contains(self.selectedQuestions,'created_at')) {
                            answerList.push(r[i].created_at); 
                        }
                        $('.grid-content-table thead', self.el).find('th', self.el).each(function(idx, el){
                            var a = r[i].answers[$(el).attr('data-qid')];
                            for(var key in a){
                                if( key == 'answer'){
                                    if(typeof a[key] === 'object'){
                                        if(a['prettyFormat'] != undefined)
                                            answerList.push(a['prettyFormat'].split('<br>').join(" "));
                                        else
                                            answerList.push(a['text']);
                                    }else{
                                        answerList.push(a[key]);
                                    }
                                }
                            }
                        });
                    for (var t in answerList){
                        $('.grid-content-table tbody', self.el).append('<td>'+
                            answerList[t] +
                            '</td>');     
                    }
                    $('.grid-content-table tbody', self.el).append('</tr>');
                }else{   
                    $('.grid-content-table', self.el).hide();
                    $('.grid-content-span',self.el).show();
                }

              
            }
        }, queryString, self.formModel.id);
        $('.grid-content-table', self.el).show();
        /**/
    },
    
    renderGridTableData: function(){
        var self = this;

    },

    renderDatePicker : function () {
        var self = this;
        var deneme;
        //build datepicker
        var now3 = new Date();
        now3.addDays(-4);
        var now4 = new Date();
        this.$el.find(".grid-date-picker",self.el).DatePicker({
            flat: true,
            format: 'd B, Y',
            date: [new Date(now3), new Date(now4)],
            calendars: 3,
            mode: 'range',
            starts: 1,
            onChange: function(formated) {
                $('.grid-date-picker-toggle > span', self.el).html(formated.join(' - '));
                self.queryModel.attributes.status = 1;
                self.queryModel.attributes.filter = formated.join(' - ');

            }   
        });
        
        this.dateState = false;
        $('.grid-date-picker-toggle > a', this.el).bind('click', function(){            
            $('.grid-date-picker', self.el).stop().animate({height: self.dateState ? 0 : $('.grid-date-picker div.datepicker', self.el).get(0).offsetHeight}, 500, function(){
                /**/
                if(self.dateState)
                    $('.grid-date-picker', self.el).addClass('opened');
                else
                    $('.grid-date-picker', self.el).removeClass('opened');
                if($('.grid-form-questions', self.el).hasClass('opened')){
                    $('.grid-form-questions', self.el).stop().animate({height: 0}, 500, function(){
                         $('.grid-form-questions', self.el).removeClass('opened');
                         self.questionState = !self.questionState;
                    });
                }
                       self.renderQuestionsDropdown();   
                       self.renderGridBody(); 
                /**/
            });
            self.dateState = !self.dateState;
            return false;
        });
    },

    renderFormQuestions: function () {
        var self = this;
        this.questionState = false;
        $('.grid-form-questions-toggle', this.el).bind('click', function(){           
            $('.grid-form-questions', self.el).stop().animate({height: self.questionState ? 0 : 200}, 500, function(){
               /**/
                if(self.questionState)
                    $('.grid-form-questions', self.el).addClass('opened');
                else
                     $('.grid-form-questions', self.el).removeClass('opened');
                if($('.grid-date-picker', self.el).hasClass('opened')){
                    $('.grid-date-picker', self.el).stop().animate({height:  0}, 500, function(){
                         $('.grid-date-picker', self.el).removeClass('opened');
                         self.dateState = !self.dateState;
                    }); 
                }
                 /**/
                $('.grid-form-questions-list', self.el).find('input').each(function(idx, el) {
                    $(el).bind('click', function(){
                            self.renderQuestionsDropdown();   
                            self.renderGridBody();  
                    });
                });
            //
            });            
            self.questionState = !self.questionState;
            return false;
        });


         
        JF.getFormQuestions(this.formModel.id, function(r){
            for(var key in r) {
                var value = r[key];
                if(value.type !== 'control_button') {
                    $(".grid-form-questions-list", self.el).append('<li>' +
                            '<input type="checkbox" data-qid="'+value.qid+'" />' + '<span >'+value.text+'</span>' +
                        '</li>');
                }
            }
            $('.grid-form-questions-list', self.el).find('input').each(function(idx, el) {
                if(idx < 4){
                    $(el).attr('checked','true');
                }
            });
            setTimeout(function(){
                self.renderQuestionsDropdown();
                self.renderGridBody();
            }, 100);
        }); 
    }
});