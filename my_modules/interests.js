const express = require('express');  //npm install -s express
var mongoose = require('mongoose');//npm install -s mongoose


var router = express.Router();


var InterestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});


var InterestModel = mongoose.model('MyInterest', InterestSchema); 
module.exports = InterestModel;


//receive data from the front end 
router.post('/add_new_interest', function( request, response){
	
	try{
		var InterestData = {
			name: request.body.name
		}
		
		InterestModel.create(InterestData, function (err, user) {
			if (err) {
			  console.log('insert new interest err : ' + err);
			  return (err);
			} else {
			  //return response.redirect('/profile');
			  console.log('success, interest created.');
			  response.sendStatus(200);
			}
		});
		//console.log(request.body);
	}catch(error)
	{
		console.log('insert new interest error : ' + error);
	}
	
});



////// login
router.get('/interests_list', function( request, response){

	try{
		
		InterestModel.find({},function(err, MyInterest){
			//sending the info to the front-end	
			response.send(MyInterest);
		});	
		
		
	}catch(error)
	{
		console.log("fetch_interests error:" + error);
	}
});






module.exports = router;
