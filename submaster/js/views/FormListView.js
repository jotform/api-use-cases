/**
 * Includes view and events for form list
 */
var FormListView = Backbone.View.extend({

    initialize: function(options){

        _.bindAll(this,"render");
        this.el = options.el;

        this.collection = new FormsCollection(options.data);

        this.collection.on("reset", this.render);

        this.template = _.template('<li><%=title%></li>');

        this.render();
    },

    render: function(){
        var self = this;

        console.log("and");
        this.$el.find("ul").html("");
        this.collection.each(function(el){
            self.$el.find("ul").append(self.template(el.attributes));
        });
    }

});