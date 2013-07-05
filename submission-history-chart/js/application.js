
var _jFCharts = {
    init: function()
    {
        var historyView = new HistoryChartView();
    }
};

google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(function(){
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
    // JF.initialize( {apiKey: "1c4efba0d67e0e77aee4dee551b4259f"} );
    _jFCharts.init();
});

$(document).ready();