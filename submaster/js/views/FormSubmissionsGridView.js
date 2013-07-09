var FormSubmissionsGridView = Backbone.View.extend({

    initialize : function (options) {
        this.formId = options.formId;

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