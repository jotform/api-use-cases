
jotModule.controller('NavigationController',function($scope){
	$scope.activeStates = {
		"index" : "active",
		"about" : "",
		"contact" : ""
	}

	$scope.changeState = function(target){
		for(var i in $scope.activeStates){
			$scope.activeStates[i] = ""
		}
		$scope.activeStates[target] = "active"
	}
});

jotModule.controller('IndexController',function($scope){
	$scope.title = "Index Controller Title";
	$scope.jf_connect_class = "db";
	$scope.jf_after_connect_class = "dn";
	$scope.jotform_connect = function(){
		JF.login(
				function(){
					$scope.jf_connect_class = "dn";
					$scope.jf_after_connect_class = "db";
					JF.getForms(function(response){
						for(var i=0; i<response.length; i++){
							//document.write( "<li> " + response[i].title);
						}
					});
				},
				function(){
					window.alert("Could not authorize user");
				}
			); 
		}
});

jotModule.controller('AboutController',function($scope){
	$scope.title = "About Us";
});

jotModule.controller('ContactController',function($scope){
	$scope.title = "Index Controller Title";
});