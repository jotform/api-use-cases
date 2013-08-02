var FormView = Backbone.View.extend({

    initialize: function( options ) {
        this.el = options.el;
        this.formModel = options.formModel;
        window.app.stateModel.set(this.formModel.id, true);
        //
        window.app.formSubmissionsCollection = new FormSubmissionsCollection();
        //
        this.render();
    },

    render: function() {
        
    }

});