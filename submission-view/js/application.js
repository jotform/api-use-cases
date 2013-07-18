
$(document).ready(function(){

    var self = window.app = this;

    if( JF.getAPIKey() === null){
        JF.login(function(){
            initializeApp();
        });
    } else {
        initializeApp();
    }

    function initializeApp(){
        
        var SM = Backbone.Model.extend({});
        window.app.stateModel = new SM();
        var Router = Backbone.Router.extend({

          routes: {
            "":                         "home",    // #help
            ":formID":                      "form", 
            "submission/:id":        "submission",  // #search/kiwis
          },

          home: function() {
            //--
            window.app.submissionsView = new submissionListView();
          },
          form: function() {
            //--
            window.app.submissionsView.getFormSubmissions();
          },
          submission: function(id) {
            window.app.submissionView = new submissionView({
                                                            model : window.app.form.get('submissions').get(id),
                                                        });         
          }

        });

        window.app.router = new Router();
        Backbone.history.start();

        JF.getUser(function(user){
            // $("#username").text(user.username);
            // $("#avatar").attr("src", user.avatarUrl);
            window.app.user = user;
            JF.getForms(function(e){
                //typeahead text box
                var opt = "";
                for ( var i in e )
                {
                    var value = e[i].id;
                    var text = e[i].title;
                    opt += "<option value=\""+value+"\">"+text+ " - " + e[i].count + "</option>\n";
                }

                $("#userFormsList").html(opt);
                $('.selectpicker').selectpicker('refresh');
                app.router.navigate('', { trigger: true })           

            });
        });

    };

});