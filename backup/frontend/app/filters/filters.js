/*
	String length cutter
*/
jotModule.filter('cutit', function() {
	return function(input, count,append) {
		if(append === undefined){
			append = "";
		}
		var out = "";
		if(count > input.length){
			count = input.length;
		}

		for (var i = 0; i < count; i++) {
			out += input.charAt(i);
		}
		return out+append;
	}
});

jotModule.filter('bsHumanize', function() {
	return function(input, count,append) {
		
		if(input == 0){
			return "Waiting";
		}
		if(input == 1){
			return "On-Going";
		}
		if(input == 2){
			return "Finished";
		}
		
		return input;
	}
});