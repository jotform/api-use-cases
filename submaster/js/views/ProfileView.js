var ProfileView = Backbone.View.extend({

    initialize: function(options) {
        this.el = options.el;
        this.template = _.template('<ul>' + 
                '<li class="user-info">'+
                    '<p style="display:inline-block;">Welcome <%=name%></p>' +
                    '<img src="<%=avatarUrl%>"/>' +
                '</li>' + 
            '</ul>');
        this.render();
    },

    render: function() {
        this.$el.html(this.template(window.app.user));
    }

});