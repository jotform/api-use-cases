var submissionView = Backbone.View.extend({
    el: "#submissionView",
    
    /**
     * Constructor
     */
    initialize: function()
    {
        form = window.app.form;
        _.bindAll(this,
            "render"
        );

        this.render();
    },

    render: function()
    {
        
        console.log('testing submission-view');
        var answers = this.model.get('answers');
        var source   = $("#submission-template").html();
        var template = Handlebars.compile(source);
        var context = {
            //header: this.model.answers[header].text,
            overview: form.get('overview')? answers[form.get('overview')].answer : 'No information',
            form_id: form.id,
            form_title: form.get('formTitle'),
            id: this.model.id,
            fullname: form.get('fullname')? answers[form.get('fullname')].prettyFormat : 'no name',
            phone: form.get('phone')? answers[form.get('phone')].answer : 'no phone',
            email: form.get('email')? answers[form.get('email')].answer : 'no email',
            title: form.get('title')? answers[form.get('title')].answer : 'no title',
            price: form.get('price')? answers[form.get('price')].answer : 'no price',
            photo_src: form.get('photo')? answers[form.get('photo')].answer[0] : 'default.png',
            photo_label: form.get('photo')? answers[form.get('photo')].text : 'No picture'
        };
        var html = template(context);
        this.$('#SubmissionList').html(html);
    }
});