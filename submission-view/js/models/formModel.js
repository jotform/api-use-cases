var formModel = Backbone.Model.extend({
    defaults: {

          submissions: new submissionCollection
    },

    initialize: function(id,submissions){
      //-- 
      this.set({'id':id});
      this.get('submissions').reset(submissions);
      self = this;
      $.each(submissions[0].answers,function(index,answer)
      {
          switch(answer.type)
          {
            case 'control_textbox':
              self.set({'title': index});
              break;
            case 'control_number':
              self.set({'price': index});
              break;
            case 'control_textarea':
              self.set({'overview': index});
              break;
            case 'control_fullname':
              self.set({'fullname': index});
              break;
            case 'control_fileupload':
              self.set({'photo': index});
              break;
          }
      });                        
    },

});