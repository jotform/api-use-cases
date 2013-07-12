jotModule.factory('jotservice',function($q){
	var jotservice = {};

	jotservice.getForms = function(){
		var deferred = $q.defer();
		JF.getForms(function(response){
			deferred.resolve(response);
		});

		return deferred.promise;
	};
	return jotservice;
});

jotModule.factory('valStorage',function(){
	var serv = {}
	var vals = []
	vals["jot_logged_in"] = false;

	serv.get = function(parName){
		if(vals[parName] !== undefined){
			return vals[parName];
		}
	}

	serv.set = function(parName,value){
		vals[parName] = value;
		return value;
	}
	return serv;
});
