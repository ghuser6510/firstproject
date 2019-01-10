const express = require('express');  //npm install -s express
var mongoose = require('mongoose');//npm install -s mongoose
var router = express.Router();
var http = require('http').Server(router); // added that for socket.io
var io = require('socket.io')(http); //npm install -s socket.io

var QuestionsSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  url_title: {
    type: String,
    required: true,
	unique : true
  },
  language: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  lastmodified: {
    type: String,
    required: true
  },
   upvotes: {
    type: Array,
    required: false
  },
   upvotes_count:{
    type: Number,
    required: false
  },
   downvotes: {
    type: Array,
    required: false
  },
   downvotes_count: {
    type: Number,
    required: false
  },
  Answers: {
    type: Array,
    required: false
  }
});


var QuestionModel = mongoose.model('MyQuestion', QuestionsSchema); 
module.exports = QuestionModel;

router.post('/post_new_question', function( request, response){
	
	try{
		
		var findQuery = { url_title : (request.body.title.replace(/[^a-z0-9\s]/gi, '')).replace(/[_\s]/g, '-') };
		QuestionModel.find(findQuery,function(err, MyQuestion){
			if(MyQuestion.length == 0) // if url_title available
			{
				var currentDate = new Date();
				var QuestionData = {
					owner: request.session.user[0]._id,//request.body.owner,
					language: request.body.language,
					title: request.body.title,
					description : request.body.description,
					lastmodified : currentDate.getTime(),
					upvotes_count : 0,
					downvotes_count : 0,
					url_title: (request.body.title.replace(/[^a-z0-9\s]/gi, '')).replace(/[_\s]/g, '-')
				}
				var redirect_url =(request.body.title.replace(/[^a-z0-9\s]/gi, '')).replace(/[_\s]/g, '-');
				//var io_vars = { from : request.body.marco, to : request.body.polo, message : request.body.messageInfo, marcoName : request.body.marcoName };
				QuestionModel.create(QuestionData, function (err, MyQuestion) {
					if (err) {
					  console.log('insert new question err : ' + err);
					  return (err);
					} else {
					  console.log('success, question created.');
					  response.send('/Question/' + redirect_url );
						//response.sendStatus(200);
					}
					//request.app.io.emit('ConversationUpdated', io_vars);
				});// end create
			} // if length 0
			else // url_title taken create record and increment count at the end of the url_title
			{
				var currentDate = new Date();
				var QuestionData = {
					owner: request.session.user[0]._id,
					language: request.body.language,
					title: request.body.title,
					description : request.body.description,
					lastmodified : currentDate.getTime(),
					upvotes_count : 0,
					downvotes_count : 0,
					url_title: (request.body.title.replace(/[^a-z0-9\s]/gi, '')).replace(/[_\s]/g, '-') + ( MyQuestion.length )
				}
				var redirect_url = (request.body.title.replace(/[^a-z0-9\s]/gi, '')).replace(/[_\s]/g, '-') + ( MyQuestion.length );
				//var io_vars = { from : request.body.marco, to : request.body.polo, message : request.body.messageInfo, marcoName : request.body.marcoName };
				QuestionModel.create(QuestionData, function (err, MyQuestion) {
					if (err) {
					  console.log('insert new question err : ' + err);
					  return (err);
					} else {
					  console.log('success, question created.');
					  response.send('/Question/' + redirect_url );
					  //response.sendStatus(200);
					}
					//request.app.io.emit('ConversationUpdated', io_vars);
				});// end create
			}
		});// first find
			
	}catch(error)
	{
		console.log('insert new question error : ' + error);
	}
	
});

router.post('/answer_question', function( request, response){
	
	try{
		
		///find existing question
		var findQuery = { _id : request.body.question_id };
		
		var io_vars = { _id : request.body.question_id, from : request.body.answer_owner, answer_description : request.body.answer_description };
		
		QuestionModel.findOne(findQuery,function(err, MyOnlyQuestion){
				var new_values = { 
					$push: { Answers :  {
								from : request.session.user[0]._id,//request.body.answer_owner, 
								answer_index : MyOnlyQuestion.Answers.length,
								answer_description : request.body.answer_description, 
								likes : [],
								dislikes : []  }  
						   } 
				};
				QuestionModel.updateOne( findQuery, new_values , { new: true }, function (err, MyQuestion){
					console.log('answer inserted successfully');
					response.sendStatus(200);
					request.app.io.emit('AnswerAdded', io_vars);
				});

		});//end .find
			
			
	}catch(error)
	{
		console.log('insert new answer error : ' + error);
	}
	
});




router.post('/update_question', function( request, response){
	
	try{
			var findQuery = { 
				$and : [
					{_id : request.body.question_id },
					{owner : request.session.user[0]._id }
				]
			};
			var currentDate = new Date();
			var new_values = { 
				description : request.body.description,
				lastmodified : currentDate.getTime()
			};
			QuestionModel.updateOne( findQuery, new_values , { new: true }, function (err, MyQuestion){
				console.log('answer updated successfully');
				response.sendStatus(200);
			});
			
	}catch(error)
	{
		console.log('update question error : ' + error);
	}
	
});

router.post('/delete_question', function( request, response){
	var findQuery = { 
		$and : [
			{_id : request.body.question_id },
			{owner : request.session.user[0]._id }
		]
	};
	
  	QuestionModel.deleteOne(findQuery, function(err, obj) {
		if (err) throw err;
		console.log("one question deleted");
    });
});


//list questions
router.get('/questions', function( request, response){ 
	try{
		response.redirect('/questions/0');
	}catch(error)
	{
		console.log("questions_error:" + error);
	}
	
});

//list my questions
router.get('/my_questions', function( request, response){ 
	try{
		if (request.session && request.session.user) {
			
			if(request.session.returnTo)
				delete request.session.returnTo;
			
			response.redirect('/my_questions/0');
		}//if logged in
		else
		{
			request.session.returnTo = request.url;
			response.redirect('/login');
		}
	}catch(error)
	{
		console.log("my_questions_error:" + error);
	}
	
});


//list all questions or filter 
router.get('/my_questions/:pageId', function( request, response){

	try{
		
		if (request.session && request.session.user) {
			
				if(request.session.returnTo)
					delete request.session.returnTo;

				var page = request.params.pageId;
				var my_limit = 3;
				var skipping = page * my_limit;

				var findQuery = { owner : request.session.user[0]._id };
			
				var keyword = "";
				if(request.query.keyword)
					keyword = request.query.keyword;

				if(request.query.language) // if query not empty
				{

					findQuery = {
						$and: [
								{ $or: [
									{ description: { $regex: keyword } },
									{ title: { $regex: keyword }}
								]},
								{ language : request.query.language },
								{ owner : request.session.user[0]._id }
							  ]			  
					};
				}// if query
			
				var sortOption = { lastmodified : -1};

				if(request.query.sortby == 'upvotes')
					sortOption = { upvotes_count : -1};
				if(request.query.sortby == 'downvotes')
					sortOption = { downvotes_count : -1};
		

				QuestionModel.find(findQuery,function(err, MyQuestion){
					total_search_results = MyQuestion.length;
					total_pages = Math.ceil(total_search_results/my_limit);


					QuestionModel.find(findQuery,{},{ skip: skipping, limit: my_limit, sort: sortOption },function(err, MyQuestion){

						response.render('pages/my_questions', {
								questions_found : MyQuestion,
								search_keyword : keyword,
								search_language : request.query.language,
								total_results: total_search_results,
								total_pages : total_pages
						});
					});//find all		


				});//end .find
			
		}//if logged in
		else
		{
			request.session.returnTo = request.url;
			response.redirect('/login');
		}
		
		
		
	}catch(error)
	{
		console.log("fetch_my_questions error:" + error);
	}
});



router.get('/questions/:pageId', function( request, response){

	try{
		
		var page = request.params.pageId;
		var my_limit = 3;
		var skipping = page * my_limit;
		
		var findQuery = {};
		
		var keyword = "";
		if(request.query.keyword)
			keyword = request.query.keyword;
		
		if(request.query.language) // if query not empty
		{
			
			findQuery = {
				$and: [
						{ $or: [
							{ description: { $regex: keyword } },
							{ title: { $regex: keyword }}
						]},
						{ language : request.query.language }							
					  ]			  
			};
		}// if query
		
		var sortOption = { lastmodified : -1};
		
		if(request.query.sortby == 'upvotes')
			sortOption = { upvotes_count : -1};
		if(request.query.sortby == 'downvotes')
			sortOption = { downvotes_count : -1};
		
		
		QuestionModel.find(findQuery,function(err, MyQuestion){
			total_search_results = MyQuestion.length;
			total_pages = Math.ceil(total_search_results/my_limit);
		
		
			QuestionModel.find(findQuery,{},{ skip: skipping, limit: my_limit, sort: sortOption },function(err, MyQuestion){

				response.render('pages/questions', {
						questions_found : MyQuestion,
						search_keyword : keyword,
						search_language : request.query.language,
						total_results: total_search_results,
						total_pages : total_pages
				});
			});//find all		
		
		
		});//end .find
		
		
	}catch(error)
	{
		console.log("fetch_questions error:" + error);
	}
});


router.get('/question/:questionUrl', function( request, response){
	try{
		var title_url = request.params.questionUrl;
		
		QuestionModel.find({url_title: title_url},function(err, MyQuestion){
			MyQuestion.forEach(function(element){
				
				if (request.session && request.session.user) { //if user logged in
					response.render('pages/question_detailed', {
							question_id : element._id,
							owner : element.owner,
							title : element.title,
							language : element.language,
							description : element.description,
							logged_user : request.session.user[0]._id,
							Answers : element.Answers,
							upvotes : element.upvotes.length,
							downvotes : element.downvotes.length
					});
				}
				else
				{
					response.render('pages/question_detailed', {
							question_id : element._id,
							owner : element.owner,
							title : element.title,
							language : element.language,
							description : element.description,
							Answers : element.Answers,
							upvotes : element.upvotes.length,
							downvotes : element.downvotes.length
					});
				}
				
			},this);// end User for each	
		});//end .find
		
	
	}catch(error)
	{
		console.log("fetch_questions error:" + error);
	}
});


/////// liking disliking answers


router.post('/like_answer', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.question_id
		};
		var new_values = { 
			//adds a value to an array unless the value is already present
			$addToSet: { 'Answers.$[t].likes' : { liker : request.session.user[0]._id } }//request.body.likers_id
		};
		var io_vars = { question_id : request.body.question_id, answer_index : request.body.answer_index };

		QuestionModel.updateOne(findQuery,new_values,{ arrayFilters: [{ "t.answer_index": Number(request.body.answer_index) }], multi: true }, function (err, MyQuestion){
			console.log('answer liked successfully');
			response.sendStatus(200);
			request.app.io.emit('AnswerLiked', io_vars);
		});		
	
	
	}catch(error)
	{
		console.log("like_answer error:" + error);
	}
});


router.post('/answer_like_check', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.question_id
		};
		var likes_index_array = new Array();
		QuestionModel.findOne(findQuery, function (err, MyQuestion){
			MyQuestion.Answers.forEach(function(answer){
				//console.log(answer);
				answer.likes.forEach(function(like){
					if(like.liker == request.session.user[0]._id )//request.body.logged_user
						likes_index_array.push(answer.answer_index);
				},this);// end User for each
			},this);// end User for each
			response.send(likes_index_array);
		});	// end find one	
		
	
	}catch(error)
	{
		console.log("answer_like_check error:" + error);
	}
});



router.post('/unlike_answer', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.question_id
		};
		var new_values = { 
			$pull: { 'Answers.$[t].likes' : { liker : request.session.user[0]._id } }
		};
		var io_vars = { question_id : request.body.question_id, answer_index : request.body.answer_index };
		
		QuestionModel.updateOne(findQuery,new_values,{ arrayFilters: [{ "t.answer_index": Number(request.body.answer_index) }], multi: true }, function (err, MyQuestion){
			console.log('answer unliked successfully');
			response.sendStatus(200);
			request.app.io.emit('AnswerUnLiked', io_vars);
		});		
	
	
	}catch(error)
	{
		console.log("unlike_answer error:" + error);
	}
});





router.post('/dislike_answer', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.question_id
		};
		var new_values = { 
			//adds a value to an array unless the value is already present
			$addToSet: { 'Answers.$[t].dislikes' : { disliker : request.session.user[0]._id } }//request.body.likers_id
		};
		var io_vars = { question_id : request.body.question_id, answer_index : request.body.answer_index };

		QuestionModel.updateOne(findQuery,new_values,{ arrayFilters: [{ "t.answer_index": Number(request.body.answer_index) }], multi: true }, function (err, MyQuestion){
			console.log('answer disliked successfully');
			response.sendStatus(200);
			request.app.io.emit('AnswerDisliked', io_vars);
		});		
	
	
	}catch(error)
	{
		console.log("dislike_answer error:" + error);
	}
});


router.post('/answer_dislike_check', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.question_id
		};
		var dislikes_index_array = new Array();
		QuestionModel.findOne(findQuery, function (err, MyQuestion){
			MyQuestion.Answers.forEach(function(answer){
				//console.log(answer);
				answer.dislikes.forEach(function(dislike){
					if(dislike.disliker == request.session.user[0]._id )//request.body.logged_user
						dislikes_index_array.push(answer.answer_index);
				},this);// end User for each
			},this);// end User for each
			response.send(dislikes_index_array);
		});	// end find one	
		
	
	}catch(error)
	{
		console.log("answer_dislike_check error:" + error);
	}
});


router.post('/undislike_answer', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.question_id
		};
		var new_values = { 
			$pull: { 'Answers.$[t].dislikes' : { disliker : request.session.user[0]._id } }
		};
		var io_vars = { question_id : request.body.question_id, answer_index : request.body.answer_index };
		
		QuestionModel.updateOne(findQuery,new_values,{ arrayFilters: [{ "t.answer_index": Number(request.body.answer_index) }], multi: true }, function (err, MyQuestion){
			console.log('answer undisliked successfully');
			response.sendStatus(200);
			request.app.io.emit('AnswerUnDisliked', io_vars);
		});		
	
	
	}catch(error)
	{
		console.log("undislike_answer error:" + error);
	}
});

///// upvoting downvoting questions

router.post('/upvote_question', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.question_id
		};
		var new_values = { 
			//adds a value to an array unless the value is already present
			$addToSet: { 'upvotes' : { liker : request.session.user[0]._id } }//request.body.likers_id
		};
		var io_vars = { question_id : request.body.question_id };
		
		QuestionModel.updateOne(findQuery,new_values,{ new:true },function (err, MyQuestion){
			console.log('question upvoted successfully');
			request.app.io.emit('QuestionUpvoted', io_vars);
		
			// cannot sort by arraw length need to store value
			QuestionModel.findOne(findQuery ,function (err, MyQuestion){
				QuestionModel.updateOne(findQuery,{upvotes_count : MyQuestion.upvotes.length, downvotes_count : MyQuestion.downvotes.length },function (err, MyQuestion){
				});
				console.log('upvote counted successfully');
				response.sendStatus(200);
			});			
		
		});
		

	
	}catch(error)
	{
		console.log("upvote_question error:" + error);
	}
});


router.post('/question_upvote_check', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.question_id
		};
		var temp_found = false;
		QuestionModel.findOne(findQuery, function (err, MyQuestion){
			MyQuestion.upvotes.forEach(function(upvote){
				if(upvote.liker == request.session.user[0]._id )//request.body.logged_user
				{	
					temp_found = true;
					return false;
				}
			},this);// end User for each
			response.send(temp_found);
		});	// end find one	
		
	
	}catch(error)
	{
		console.log("question_upvote_check error:" + error);
	}
});



router.post('/unupvote_question', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.question_id
		};
		var new_values = { 
			$pull: { 'upvotes' : { liker : request.session.user[0]._id } }
		};
		var io_vars = { question_id : request.body.question_id };
		
		QuestionModel.updateOne(findQuery,new_values,{ new:true }, function (err, MyQuestion){
			console.log('question unupvoted successfully');
			//response.sendStatus(200);
			request.app.io.emit('QuestionUnUpvoted', io_vars);
		
			// cannot sort by arraw length need to store value
			QuestionModel.findOne(findQuery, function (err, MyQuestion){
				QuestionModel.updateOne(findQuery,{upvotes_count : MyQuestion.upvotes.length, downvotes_count : MyQuestion.downvotes.length },function (err, MyQuestion){
				});
				console.log('unupvote counted successfully');
				response.sendStatus(200);
			});
			
		});	
		

	
	}catch(error)
	{
		console.log("unupvote_question error:" + error);
	}
});



router.post('/downvote_question', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.question_id
		};
		var new_values = { 
			//adds a value to an array unless the value is already present
			$addToSet: { 'downvotes' : { disliker : request.session.user[0]._id } }//request.body.likers_id
		};
		var io_vars = { question_id : request.body.question_id };

		QuestionModel.updateOne(findQuery,new_values,{ new:true }, function (err, MyQuestion){
			console.log('question downvoted successfully');
			//response.sendStatus(200);
			request.app.io.emit('QuestionDownvoted', io_vars);
		
			// cannot sort by arraw length need to store value
			QuestionModel.findOne(findQuery, function (err, MyQuestion){
				QuestionModel.updateOne(findQuery,{upvotes_count : MyQuestion.upvotes.length, downvotes_count : MyQuestion.downvotes.length },function (err, MyQuestion){
				});
				console.log('downvote counted successfully');
				response.sendStatus(200);
			});		
		
		});	
		
	
	}catch(error)
	{
		console.log("downvote_question error:" + error);
	}
});


router.post('/question_downvote_check', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.question_id
		};
		var temp_found = false;
		QuestionModel.findOne(findQuery, function (err, MyQuestion){
			MyQuestion.downvotes.forEach(function(downvote){
				if(downvote.disliker == request.session.user[0]._id )//request.body.logged_user
				{	
					temp_found = true;
					return false;
				}
			},this);// end User for each
			response.send(temp_found);
		});	// end find one	
		
	
	}catch(error)
	{
		console.log("question_downvote_check error:" + error);
	}
});



router.post('/undownvote_question', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.question_id
		};
		var new_values = { 
			$pull: { 'downvotes' : { disliker : request.session.user[0]._id } }
		};
		var io_vars = { question_id : request.body.question_id };
		
		QuestionModel.updateOne(findQuery,new_values,{ new:true }, function (err, MyQuestion){
			console.log('question undownvoted successfully');
			//response.sendStatus(200);
			request.app.io.emit('QuestionUnDownvoted', io_vars);
		
			// cannot sort by arraw length need to store value
			QuestionModel.findOne(findQuery, function (err, MyQuestion){
				QuestionModel.updateOne(findQuery,{upvotes_count : MyQuestion.upvotes.length, downvotes_count : MyQuestion.downvotes.length },function (err, MyQuestion){
				});
				console.log('undownvote counted successfully');
				response.sendStatus(200);
			});		
			
		});	
		
	
	}catch(error)
	{
		console.log("undownvote_question error:" + error);
	}
});





module.exports = router;
