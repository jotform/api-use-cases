var SubmissionsCollection = Backbone.Collection.extend({ 

    cache: {},

    fetch : function(query, callback){

        var key = createCacheKey(query), 
            self = this;
        if( this.cache[key] !== undefined ) {
            callback(this.cache[key]);
            return;
        }

        JF.getSubmissions(query, function(resp) {
            callback(resp);
            self.cache[key] = resp;
            for (var i=0; i<resp.length; i++) {
                if( self.get(resp[i].id) === undefined ) {
                    self.add(resp[i]);
                }
            }
        });

        function createCacheKey(){
            if(typeof query === 'undefined') return "default";
            var key = "";
            for(var i in query){
                var t = query[i];
                if(typeof query[i] === 'object') t = JSON.stringify(query[i]);
                if( query[i] !== undefined ) key = key + i + t;
            }
            return key;
        }

    },

});