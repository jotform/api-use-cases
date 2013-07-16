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

	jotservice.sendFormListToServer = function(forms){

		//prepare post parameters, form list should be form id array of all forms
		// submissions tasks should be an array of 50 submissions at once,
		// for example if form x has 120 submissions then submission backup tasks should be [{range:[0,50]},{range:[51,100],[range:101,120]}]
		var tasks = [];
		var submissions_per_task = 50; 
		for(var i=0; i<forms.length;i++){
			var curform = forms[i];
			var curTask = {
				formTitle : curform.title,
				id : curform.id,
				submissionTasks : []
			}

			//populate submissionsTasks array
			if(curform.count != 0){ //add tasks only if count bigger than zero

				var sub_tasks_count = Math.ceil(parseInt(curform.count)/submissions_per_task);
				var low_range = 1;
				var high_range = submissions_per_task; //this values will be 0,50 at first run
				for(var j=0; j<sub_tasks_count;j++){
					curTask.submissionTasks.push([low_range,high_range]);
					low_range = high_range+1;
					high_range = high_range + submissions_per_task; //modify low range high range for next loop execution
				}
			}

		tasks.push(curTask); //push prepared task to tasks array   


		}
		console.log(tasks);

		return $http.post("/goback/addBackupTasks",{tasks:angular.toJson(tasks)}).then(function(response){
			console.log("/addBackupTasks  => ",response);
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
