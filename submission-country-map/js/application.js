
var _jFLocations = {
    init: function()
    {
        var submissionMap = new submissionMapView();
    }
};

google.load("visualization", "1", {packages:["geochart"]});

$(document).ready(function(){
    if ( !JF.getAPIKey() )
    {
        JF.login(function(){
            _jFLocations.init();
        });
    }
    else
    {
        _jFLocations.init();
    }
});