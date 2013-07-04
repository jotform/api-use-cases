
var _jFCharts = {
    init: function()
    {
        var historyView = new HistoryChartView();
    }
};

google.load("visualization", "1", {packages:["corechart"]});

$(document).ready(function(){
    if ( !JF.getAPIKey() )
    {
        JF.login(function(){
            _jFCharts.init();
        });
    }
    else
    {
        _jFCharts.init();
    }

    // JF.initialize( {apiKey: "76d37e1b759fcbe67063a39166747301"} );
    // _jFCharts.init();
});