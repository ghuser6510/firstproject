const express = require('express');  //npm install -s express
var mongoose = require('mongoose');//npm install -s mongoose


var router = express.Router();


var favouritelinkSchema = new mongoose.Schema({
  owner:{
    type: String,
    required: true
  },
  links: {
    type: Array,
    required: false
  }
});


var favouritelinkModel = mongoose.model('Myfavouritelink', favouritelinkSchema); 
module.exports = favouritelinkModel;


//receive data from the front end 
router.post('/add_new_favouritelink', function( request, response){
	
	try{
		
		var findQuery = { owner: request.session.user[0]._id };

		favouritelinkModel.find(findQuery,function(err, Myfavouritelink){
			if(Myfavouritelink.length == 0){

				var favouritelinkData = {
					owner: request.session.user[0]._id,
					links : { link_id : request.body.link_id }
				}
				favouritelinkModel.create(favouritelinkData, function (err, user) {
					if (err) {
					  console.log('insert new favouritelink err : ' + err);
					  return (err);
					} else {
					  //return response.redirect('/profile');
					  console.log('success, favouritelink created.');
					  response.sendStatus(200);
					}
				});	
				
			}else{
				var new_values ={
					$addToSet: { links : { link_id : request.body.link_id } }
				}
				favouritelinkModel.updateOne( findQuery , new_values , { new: true }, function (err, Myfavouritelink){
					console.log('link added to favourites successfully');
					response.sendStatus(200);
				});
			}
		});// first find
		
		//console.log(request.body);
	}catch(error)
	{
		console.log('insert new favouritelink error : ' + error);
	}
	
});


router.post('/remove_from_favouritelink', function( request, response){
	
	try{
		
		var findQuery = { owner: request.session.user[0]._id };

		var new_values ={
			$pull: { links : { link_id : request.body.link_id } }
		}
		favouritelinkModel.updateOne( findQuery , new_values , { new: true }, function (err, Myfavouritelink){
			console.log('link removed from favourites successfully');
			response.sendStatus(200);
		});
		
		//console.log(request.body);
	}catch(error)
	{
		console.log('remove favouritelink error : ' + error);
	}
	
});


////// 
router.post('/check_favourited_link', function( request, response){

	try{
		var findquery = {
			$and: [
				{ 'links.link_id': { $regex: request.body.link_id }},
				{ owner : request.session.user[0]._id }
			  ]		
		}
		favouritelinkModel.find(findquery,function(err, Myfavouritelink){
			//sending the info to the front-end	
			if(Myfavouritelink.length > 0)
				response.send(true);
			else
				response.send(false);
		});	
		
		
	}catch(error)
	{
		console.log("check_favourited_link error:" + error);
	}
});






module.exports = router;
