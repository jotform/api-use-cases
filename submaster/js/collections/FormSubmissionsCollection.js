/*var FormSubmissionsCollection = Backbone.Collection.extend({ 

    cache: {},

    fetch : function(callback , a, query ,formId){
        var key = createCacheKey(query), 
            self = this;
        if( this.cache[key] !== undefined ) {
            callback(this.cache[key]);
            return;
        }

        JF.getFormSubmissions(formId, query, function(resp) {
            callback(resp);
            self.cache[key] = resp;
            for (var i=0; i<resp.length; i++) {
                if( self.get(resp[i].id) === undefined ) {
                    self.add(resp[i]);
                }
            }
        });

        function createCacheKey(){
            if(typeof a === 'undefined') return "default";
            var key = "";
            for(var i in a){
                var t = a[i];
                if(typeof a[i] === 'object') t = JSON.stringify(a[i]);
                if( a[i] !== undefined ) key = key + i + t;
            }
            return key;
        }

    },

});*/

var FormSubmissionsCollection = Backbone.Collection.extend({ 

    cache: {},

    fetch : function(callback ,query ,formId){
        var key = createCacheKey(query,formId), 
            self = this;
        if( this.cache[key] !== undefined ) {
            callback(this.cache[key]);
            return;
        }

        JF.getFormSubmissions(formId, query, function(resp) {
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
                if( query[i] !== undefined ) key = key + i + t +formId;
            }
            return key;
        }

    },

});
