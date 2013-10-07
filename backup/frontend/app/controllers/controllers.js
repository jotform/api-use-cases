
jotModule.controller('NavigationController',function($scope){
	$scope.activeStates = {
		"index" : "active",
		"about" : "",
		"backups" : "",
		"contact" : ""
	}

	$scope.changeState = function(target){
		for(var i in $scope.activeStates){
			$scope.activeStates[i] = ""
		}
		$scope.activeStates[target] = "active"
	}
});

jotModule.controller('IndexController',function($scope,$location,valStorage,$timeout){
	$scope.title = "Index Controller Title";
	
	$scope.forms = [];

	$scope.jot_logged_in = valStorage.get("jot_logged_in");

	$scope.jotform_connect = function(){
		JF.login(
				function(){
					$timeout(function(){
						$scope.jot_logged_in=valStorage.set("jot_logged_in",true);
					},1);
				},
				function(){
					window.alert("Could not authorize user");
				}
			); 
	}

	$scope.go = function ( ) {
		$location.path('/backup');
	};


});

jotModule.controller('AboutController',function($scope){
	$scope.title = "About Jotform Back-Up Service";
});

jotModule.controller('ContactController',function($scope){
	$scope.title = "Index Controller Title";
});

/*
	Directly render list of forms and start migration progres, which means sending entire list of forms to backend

	and after receiving ACK message 
*/
jotModule.controller('BackupController',function($scope,jotservice,$timeout,$location){
	$scope.forms = [];
	$scope.user = {};
	$scope.backupState = "backup0";
	$scope.jobHash = "";

	var service = jotservice;
	var promis = service.getForms();
	promis.then(function(response){
		$scope.forms = response;
		return service.getUser();
	})
	.then(function(user){
		$scope.user = user;
		return service.getApiKey();
	})
	.then(function(apiKey){
		$scope.apiKey = apiKey;
		$scope.backupState = "backup1";
	});


	$scope.startBackup = function(){
		//first check if there is unfinished backup or not
		service.hasOngoingBackups($scope.user,$scope.apiKey).then(function(response){
			if(response.data.result === true){
				$location.path('/backups');
				return false;
			}else{
				return service.sendFormListToServer($scope.forms,$scope.user,$scope.apiKey);
			}
		})
		.then(function(response){ //send scope.forms over http to server
			console.log("response ",response);
			if(response === false){
				return;
			}
			$scope.jobHash  =response.data.result;
			$timeout(function(){// put deferred into a $timeout to make it in $digest cycle
				$scope.backupState="backup2"; //move to next state
			},1);
			return;
		});
	}
});

jotModule.controller('BackupStatusController',function($scope,jotservice,$routeParams,$timeout){
	$scope.jobHash = $routeParams.jobHash;
	$scope.backupState = "backup0";


	$scope.checkStatus = function(){
		$scope.backupState = "backup0";
		var promis = jotservice.getJobStatus($scope.jobHash);
		promis.then(function(response){
			var jobData = response.data.result;
			$timeout(function(){
				$scope.backupState = "backup1";
				$scope.jobData = jobData;
			},1);
		});
	};

	$scope.checkStatus();
});

jotModule.controller('BackupListController',function($scope,jotservice,$routeParams,$timeout){
	$scope.jobHash = $routeParams.jobHash;
	$scope.backupState = "backup0";

	$scope.getJobs = function(){
		$scope.backupState = "backup0";
		var service = jotservice;
		var promis = service.getUser();
		promis.then(function(response){
			$scope.user = response;
			return service.getUser();
		})
		.then(function(user){
			return jotservice.getJobs(user);
		})
		.then(function(response){
			$timeout(function(){
				$scope.backupState = "backup1";
				$scope.jobs = response.data.result;;
			},1);
		});
	};

	$scope.getJobs();
});






