var TestModel = Backbone.Model.extend({

    calculateShit: function(){
        return this.get("height") * this.get("width");
    }

});