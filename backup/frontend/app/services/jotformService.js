jotModule.factory('jotservice',function($q,$timeout,$http){
	var jotservice = {};

	jotservice.getForms = function(){

		var deferred = $q.defer();
		JF.getForms(function(response){
			$timeout(function(){// put deferred into a $timeout to make it in $digest cycle
				deferred.resolve(response);
			},1);
		});
		return deferred.promise;
	};

	jotservice.getUser = function(){

		var deferred = $q.defer();
		JF.getUser(function(response){
			$timeout(function(){// put deferred into a $timeout to make it in $digest cycle
				deferred.resolve(response);
			},1);
		});
		return deferred.promise;
	};

	jotservice.getApiKey = function(){

		var deferred = $q.defer();
		var apiKey = JF.getAPIKey();
		$timeout(function(){// put deferred into a $timeout to make it in $digest cycle
			deferred.resolve(apiKey);
		},1);
		return deferred.promise;
	};

	jotservice.sendFormListToServer = function(forms,user,apiKey){

		//prepare post parameters, form list should be form id array of all forms
		// submissions tasks should be an array of 50 submissions at once,
		// for example if form x has 120 submissions then submission backup tasks should be [{range:[0,50]},{range:[51,100],[range:101,120]}]
		var tasks = [];
		var submissions_per_task = 50; 
		for(var i=0; i<forms.length;i++){
			var curform = forms[i];
			var curTask = {
				formTitle : curform.title,
				id : curform.id
			}
			tasks.push(curTask); //push prepared task to tasks array
		}

		var postData = {
			method : "setTasks",
			data : {
				forms : tasks,
				username : user.username,
				email : user.email,
				apiKey : apiKey
			}
		};

		return $http.post("/tmp_backend/handler.php",postData).then(function(response){
			console.log("/tmp_backend/handler.php  => ",response);
			return response;
		});
	}


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
