var SubmissionsCollection = Backbone.Collection.extend({ 

    cache: {},

    fetch : function(callback, query){
        var key = createCacheKey(query), 
            self = this;
        if( this.cache[key] !== undefined ) {
            callback(this.cache[key]);
        }

        JF.getSubmissions(function(resp){
            callback(resp);
            self.cache[key] = resp;
        }, query)

        function createCacheKey(){
            if(typeof query === 'undefined') return "default";
            var key = "";
            for(var i in query){
                if( query[i] !== 'undefined' ) key = key + i + query[i];
            }
            return key;
        }

    },

});