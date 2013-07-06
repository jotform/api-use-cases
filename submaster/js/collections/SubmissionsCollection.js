var SubmissionCollections = Backbone.Collection.extend({ 

    cache: {},
    fetch : function(callback, query){


        var key = createCacheKey(query), 
            self = this;
        if( this.cache[key] !== undefined ) {
            return this.cache[key];
        }

        JF.getSubmissions(function(resp){
            callback();
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