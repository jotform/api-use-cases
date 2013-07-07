/**
 * backbone collection for common methods on user forms array
 *
 * initialize like
 *
 * var fc = new FormsCollection(formArray)
 * @type {[type]}
 */
var FormsCollection = Backbone.Collection.extend({
    
    getForms: function(orderBy, offset, limit, desc){

        var desc = desc || "desc";

        if(this.models[0].get(orderBy) === undefined){
            console.error("orderBy field do now exist");
            return [];
        }

        var sorted = _.sortBy(this.models, function(el){ 
            if(isNaN(parseInt(el.get(orderBy)))){
                return el.get(orderBy); 
            }
            return parseInt(el.get(orderBy), 10);
        });

        if(desc === "desc"){
            return sorted.reverse().slice(offset, limit); 
        }
        //console.log(sorted);
        return sorted.slice(offset, limit);
    },

    getTitleById : function() {
        _.
    }

});