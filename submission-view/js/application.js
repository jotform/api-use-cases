
$(document).ready(function(){

    window.app = this;

    if( JF.getAPIKey() === null){
        JF.login(function(){
            initializeApp();
        });
    } else {
        initializeApp();
    }

    function initializeApp(){
        $('.page').hide();
        var Router = Backbone.Router.extend({

          routes: {
            "":                         "home",    // #help
            "submissions":              "submissions", 
            "submission/:id":           "submission",
            "createList":               "createList",
            "createView":               "createView",
          },

          home: function() {
            //--
            $('#nav').find('li').removeClass('active');
            $('#home').addClass('active');
            window.app.main = new appView();
          },
          submissions: function() {
            //--
            if(window.app.form)
            {
              $('#nav').find('li').removeClass('active');
              $('#widgetPreview').addClass('active');
              window.app.submissionsView = new submissionListView();
            }
            else
            {
              this.navigate('',{trigger:true});
            }
          },
          submission: function(id) {
            if(window.app.form)
            {       
              if(id)
              {
                $('#nav').find('li').removeClass('active');
                $('#widgetPreview').addClass('active');
                window.app.submissionView = new submissionView({'id' : id});
              }     
              else
              {
                this.navigate('submissions',{trigger:true});
              }
            }
            else
            {
              this.navigate('', { trigger: true });
            }         
          },
          createList: function() {
            if(window.app.form)
            { 
              $('#nav').find('li').removeClass('active');
              $('#createList').addClass('active');
              window.app.createView = new createList();
            }
            else
            {
              this.navigate('', { trigger: true });       
            }
          },
          createView: function() {
            if(window.app.form)
            { 
              $('#nav').find('li').removeClass('active');
              $('#createTemplate').addClass('active');
              window.app.createView = new createView();
            }
            else
            {
              this.navigate('', { trigger: true });       
            }
          }

        });

        window.app.router = new Router();
        Backbone.history.start();

        JF.getUser(function(user){
            // $("#username").text(user.username);
            // $("#avatar").attr("src", user.avatarUrl);
            window.app.user = user;
            registerUser(user);
            if(window.app.form)
            {
              $('#form').html("<b>".window.app.form.get('formTitle')+"</b>");
            }
            
        });

    };

    function registerUser(user){
      $.post('register.php', {'user':user, 'apiKey': JF.getAPIKey()}, function(response) {
            //--
        }, 'json');

    };

});