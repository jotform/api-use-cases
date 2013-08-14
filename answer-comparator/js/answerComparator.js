document.observe('dom:loaded', function() {
    AnswerComparator.getAnswers();
});

AnswerComparator = {

	otherUsers: {},

	/*
	**GET submissions for form from AJotform API
	*/
	getAnswers: function() {
		var url = 'answerComparator.php';
		new Ajax.Request(url, {
		  	onSuccess: function(data) {
		  		var createComparisonString = function(obj, arr) {
		  			var out = [];
		  			for(var j = 0; j < arr.length; j++) {
		  				if(obj[arr[j]])
		  					out.push(obj[arr[j]].trim());
		  			}
		  			return out.join('-');
		  		};
		  		var toStr = [];

		  		var submission;
		  		$this = AnswerComparator;
		  		$this.numberOfReponses = data.responseJSON.length;
		  		var response;
		  		var answer;
		  		var type;

		  		for(var i=0; i < data.responseJSON.length; i++) {
		  			submission = data.responseJSON[i];
		  			for(key in submission.answers) {
		  				if(('answer' in submission.answers[key]) && ('type' in submission.answers[key])) {

		  					answer = submission.answers[key].answer;
		  					type = submission.answers[key].type.split('control_')[1];

			  				if(!$this.otherUsers.hasOwnProperty(key)) {
			  					$this.otherUsers[key] = {};
			  					$this.otherUsers[key].responses = {};
			  					$this.otherUsers[key].id = key;
			  					$this.otherUsers[key].label = submission.answers[key].text;
			  					$this.otherUsers[key].type = type;
			  				}

		  					if(Object.isArray(answer)) {
		  						response = answer.join('-');
			  				} else {
			  					switch(type) {
			  				 		case "datetime":
				  						toStr = ['year', 'month', 'day', 'hour', 'minute', 'ampm'];
			  							response = createComparisonString(answer, toStr);	  							
				  						break;
									
									case "fullname":
										toStr = ['prefix', 'first', 'middle', 'last', 'suffix'];
			  							response = createComparisonString(answer, toStr);		
			  							break;
			  				
			  						case "address":
			  							toStr = ['addr_line1', 'addr_line2', 'city', 'state', 'postal', 'country'];
			  							response = createComparisonString(answer, toStr);
			  							break;
			  				
			  						case "phone":
			  							toStr = ['area', 'phone', 'country'];
			  							response = createComparisonString(answer, toStr);
			  							break;

			  						case "time":
			  							toStr = ['hourSelect', 'minuteSelect', 'ampm', 'hourSelectRange', 'minuteSelectRange', 'ampmRange'];
			  							response = createComparisonString(answer, toStr);
			  							break;

			  						case 'birthdate':
			  							toStr = ['month', 'day', 'year']; 
			  							response = createComparisonString(answer, toStr);
			  							break;

			  						case 'grading':
			  							for(grade in answer) {
			  								toStr.push(grade);
			  							}
			  							response = createComparisonString(answer, toStr);
			  							break;

			  						case 'range':
			  							toStr = ['from', 'to']; 
			  							response = createComparisonString(answer, toStr);
			  							break;

			  						case 'checkbox':
			  							reponse = '';
			  							for(var an in answer){
			  								response += answer[an] + '-';
			  							}
			  							response = response.slice(0, - 1);
			  							break;
			  						case 'radio':
			  							if(typeof answer === 'object') {
			  								reponse = '';
				  							for(var an in answer){
				  								response = answer[an];
				  							}
			  							} else {
			  								response = answer;
			  							}
			  							break;
			  						default:
			  							response = answer;
			  					}
			  				}

			  				response = response.toLowerCase();

			  				if($this.otherUsers[key].responses.hasOwnProperty(response)) {			  					
			  					$this.otherUsers[key].responses[response]++;
			  				} else {
			  					$this.otherUsers[key].responses[response] = 1;
			  				} 
			  			}
		  			}
		  		}
		  		$this.setListeners();
		  	}
		});
	}, 


	/*
	** Run the compare answers function whenever something on the form changes
	*/
	setListeners: function() {
		var comparison;

		var createListener = function(el, event, type) {
			if($(el)) {
				(function(type) {
					$(el).observe(event, function(e) {
						AnswerComparator.compareAnswers(e.target, type);
					});
				})(type);
			} 
		}

		for(key in this.otherUsers) {
			var question = this.otherUsers[key];
			var type = question.type;

			switch(type) {
				case 'email':
				case 'autocomp':
				case 'fullname':
				case 'address':
				case 'phone':
				case 'textbox':
				case 'number':
				case 'textarea':
				case 'spinner':
					createListener('id_' + question.id, 'keyup', type); 
					createListener('input_' + question.id, 'blur', type); 
					break;

				case 'grading':
					createListener('input_' + question.id, 'release', type); 
					break;

				case 'scale':
				case 'rating':
					createListener('id_' + question.id, 'click', type);
					break;

				case 'radio':
				case 'checkbox':
					createListener('id_' + question.id, 'click', type);
					$('id_' + question.id).select('input').each(function(el) {
						createListener(el, 'keyup', type);
					});
					break;

				case 'range':
					createListener('id_' + question.id, 'click', type);
					createListener('id_' + question.id, 'keyup', type); 
					break;

				case 'slider':
					createListener('id_' + question.id, 'click', type); 
					break;

				case 'dropdown':
					createListener('input_' + question.id, 'change', type); 
					break;

				case 'datetime':
					createListener('id_' + question.id, 'date:changed', type);
					$('id_' + question.id).select('select').each(function(el) {
						createListener(el, 'change', 'timePortion'); 
					});
					break;

				case 'time':
				case 'birthdate':
					$('id_' + question.id).select('select').each(function(el) {
						createListener(el.id, 'change', type);
					});
					break;

				default:
					console.log('Answer Comparator Does not support type ' + type);


			}
			comparison = new Element('span', {class: 'comparisonText'}).update('<br/>&nbsp');
			comparison.setStyle({fontSize: '13pt', color: 'orange'});
			$('id_' + question.id).down('.form-input').insert(comparison);
		}
	},

	/*
	**Compare the submission to the currently focused entry
	*/

	compareAnswers: function(el, type) {
		var current = '';
		var output = '';
		var id;

		if(type == 'datetime') {
			id = el.id.split('id_')[1];
		} else {
			if(el.up('li')) {
				id = el.up('li').id.split('id_')[1];
			} else {
				return;
			}
		}

		switch(type) {
			case 'checkbox':
	            var checked = [];
	            el.up('.form-input').select('input[type=' + type + ']:checked').each(function(chk) {
	                checked.push(chk.value);
	            });
				current = checked.join('-');
				break;

			case 'datetime':
			case 'timePortion':		
				current = $('year_'+id).getValue().trim() + '-' + $('month_'+id).getValue().trim() + '-' + $('day_'+id).getValue().trim() + '-';

				el = (type == 'timePortion') ? el.up('li') : el;
				el.select('select').each(function(el) {
					current += (el.getValue().trim())? el.getValue().trim() + '-': '';
				});
				current = current.slice(0, - 1);
				break;

			case 'email': 
				current = hex_md5(el.getValue().trim()); //ntw test this with a couple of hundred emails
				break;

			case 'address':
				el.up('li').select('input[type=text]').each(function(el) {
					current += el.getValue().trim() + '-';
				});
				current += el.up('li').select('select')[0].getValue();
				break;

			case 'grading':
			case 'phone':
			case 'range':
			case 'fullname':
				el.up('li').select('input').each(function(el) {
					current += el.getValue().trim() + '-';
				});
				current = current.slice(0, - 1);
				break;

			case 'time':
			case 'birthdate':
				el.up('li').select('select').each(function(el) {
					current += (el.getValue().trim())? el.getValue().trim() + '-' : '';
				});
				current = current.slice(0, - 1);
				break;

			case 'rating':
				current = el.up('li').select('input[name=q' + id + '_star]')[0].getValue().trim();
				break;

			case 'slider':
				el = $('input_' + id);
				current = el.getValue().trim();
				break; 

			default:
				current = el.getValue().trim();
		}

		if(this.otherUsers[id].responses.hasOwnProperty(current.toLowerCase())) {
			var matches = this.otherUsers[id].responses[current.toLowerCase()];
			var percentage = (100/this.numberOfReponses*matches).toFixed(1);
			var responsesText = (matches > 1) ? 'responses' : 'response';
			output = 'This response matches ' + matches + ' ' + responsesText + ' (' + percentage  + '%)';
		} else {
			output = 'This entry is unique';
		}
		$('id_' + id).down('.comparisonText').update('<br>' + output);
	}
}
