const express = require('express');  //npm install -s express
var mongoose = require('mongoose');//npm install -s mongoose


var router = express.Router();


var suggestionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  }
});


var suggestionModel = mongoose.model('Mysuggestion', suggestionSchema); 
module.exports = suggestionModel;


//receive data from the front end 
router.post('/add_new_suggestion', function( request, response){
	
	try{
		var suggestionData = {
			from: request.session.user[0]._id,
			description: request.body.description,
			username: request.session.user[0].username
		}
		
		suggestionModel.create(suggestionData, function (err, user) {
			if (err) {
			  console.log('insert new suggestion err : ' + err);
			  return (err);
			} else {
			  //return response.redirect('/profile');
			  console.log('success, suggestion created.');
			  response.sendStatus(200);
			}
		});
		//console.log(request.body);
	}catch(error)
	{
		console.log('insert new suggestion error : ' + error);
	}
	
});

////// login
router.get('/suggestions_list', function( request, response){

	try{
		
		suggestionModel.find({},function(err, Mysuggestion){
			//sending the info to the front-end	
			response.send(Mysuggestion);
		});		
		
	}catch(error)
	{
		console.log("fetch_suggestions error:" + error);
	}
});






module.exports = router;
