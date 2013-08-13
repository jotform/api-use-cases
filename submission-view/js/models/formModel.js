var formModel = Backbone.Model.extend({
    defaults: {

          submissions: new submissionCollection
    },

    initialize: function(id,submissions){
      //-- 
      this.set({'id':id});
      this.get('submissions').reset(submissions);
      //set form fields
      fields = new Object();
      
      self = this;
      $.each(submissions[0].answers,function(index,answer)
      {
        fields[answer.type] = answer.text;
      });
      //set form fields
      this.set({'fields':fields});                        
    },

});