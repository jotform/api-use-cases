var SubmissionDetailView = Backbone.View.extend({

    tagName: 'div',
    className: 'white-popup',

    initialize: function(options) {
        this.submission = options.submission;
        this.render();
    },

    render: function() {
        var self = this;

        var contentMarkup = '<div>';
        var answers = this.submission.answers;

        _.each(answers, function(answer) {

            var questionText = answer.text.length > 23 ? answer.text.slice(0,20) + '...' : answer.text;

            switch(answer.type) {

                case "control_textbox"      :
                case "control_textarea"     :
                case "control_dropdown"     :
                case "control_radio"        :
                case "control_checkbox"     :
                case "control_datetime"     :
                case "control_phone"        :
                case "control_email"        :
                case "control_fileupload"   :
                case "control_fullname"     :
                case "control_range"        :
                case "control_grading"      :
                case "control_spinner"      :
                    contentMarkup += '<div class="answer-wrapper"><span class="submission-q">' + questionText + '</span> : <span>' + (answer.prettyFormat || answer.answer) + '</span></div>';
                    break;                
            }

        });

        contentMarkup += '</div>';

        this.$el.html(contentMarkup);

    }

});