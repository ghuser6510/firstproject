const express = require('express');  //npm install -s express
var mongoose = require('mongoose');//npm install -s mongoose
var router = express.Router();
var http = require('http').Server(router); // added that for socket.io
var io = require('socket.io')(http); //npm install -s socket.io

var ConversationsSchema = new mongoose.Schema({
  marco: {
    type: String,
    required: true
  },
  polo: {
    type: String,
    required: true
  },
  lastmodified: {
    type: String,
    required: true
  },
  Messages: {
    type: Array,
    required: false
  }
});


var ConversationModel = mongoose.model('MyConversation', ConversationsSchema); 
module.exports = ConversationModel;


router.post('/post_message', function( request, response){
	
	try{
		
		///find existing conversation
		
		var findQuery = {
              $or: [
                { marco: request.body.marco, polo: request.body.polo },
                { polo: request.body.marco, marco : request.body.polo}
              ]
        };
		ConversationModel.find(findQuery,function(err, MyConversation){
			//sending the info to the front-end	
			//response.send(MyConversation);
			//if no conversation found then create one
			if(MyConversation.length == 0)
			{
				var currentDate = new Date();
				var ConversationData = {
					marco: request.body.marco,
					polo: request.body.polo,
					lastmodified : currentDate.getTime(),
					Messages :  { from : request.body.marco, marcoName : request.body.marcoName, message : request.body.messageInfo, read : false } 
				}
				var io_vars = { from : request.body.marco, to : request.body.polo, message : request.body.messageInfo, marcoName : request.body.marcoName };
				ConversationModel.create(ConversationData, function (err, MyConversation) {
					if (err) {
					  console.log('insert new conversation err : ' + err);
					  return (err);
					} else {
					  console.log('success, conversation created.');
					  response.sendStatus(200);
					}
					request.app.io.emit('ConversationUpdated', io_vars);
				});// end create
			}// if conversations_found.length == 0
			else
			{
				MyConversation.forEach(function(element){
					//console.log(element);
					var io_vars = { from : request.body.marco, to : request.body.polo, message : request.body.messageInfo, marcoName : request.body.marcoName };
					var currentDate = new Date();
					var new_values = { 
						$push: { Messages :  { from : request.body.marco, marcoName : request.body.marcoName, message : request.body.messageInfo, read : false }  } ,
						lastmodified : currentDate.getTime()
					};
					ConversationModel.updateOne( { marco : element.marco , polo : element.polo }, new_values , { new: true }, function (err, MyConversation){
						console.log('message inserted successfully');
						response.sendStatus(200);
						request.app.io.emit('ConversationUpdated', io_vars);
					});
				},this);// end User for each	
			}
			
			
		});// first find
		
		
			
			
	}catch(error)
	{
		console.log('insert new conversation error : ' + error);
	}
	
});

////// 
router.get('/request_conversations', function( request, response){

	try{
		var findQuery = {
              $or: [
                { marco: request.session.user[0]._id } , { polo: request.session.user[0]._id }
              ]
        };
		ConversationModel.find(findQuery,{},{ sort: { lastmodified : -1 }},function(err, MyConversation){
			//sending the info to the front-end	
			response.send(MyConversation);
		});		
		
	}catch(error)
	{
		console.log("fetch_conversation error:" + error);
	}
});



router.post('/mark_message_read', function( request, response){

	try{
		var findQuery = {
              $or: [
                { marco: request.body.marco, polo: request.body.polo },
                { polo: request.body.marco, marco : request.body.polo}
              ]
        };
		ConversationModel.find(findQuery,function(err, MyConversation){
				MyConversation.forEach(function(element){
					//console.log(element);
					//https://jira.mongodb.org/browse/SERVER-1243 mongoose array options
					ConversationModel.updateMany({ marco:element.marco , polo:element.polo}, { $set :{ "Messages.$[i].read":true} }, { arrayFilters: [{"i.read": false }] }, function (err, MyConversation){
						console.log('message read successfully');
						response.sendStatus(200);
						//request.app.io.emit('ConversationUpdated', io_vars);
					});
				},this);// end User for each	
		});// first find
	}catch(error)
	{
		console.log("mark_message_read error:" + error);
	}
});





module.exports = router;
