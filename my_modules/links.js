const express = require('express');  //npm install -s express
var mongoose = require('mongoose');//npm install -s mongoose
var router = express.Router();
var http = require('http').Server(router); // added that for socket.io
var io = require('socket.io')(http); //npm install -s socket.io

var LinksSchema = new mongoose.Schema({
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
  url_destination:{
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
  Comments: {
    type: Array,
    required: false
  }
});


var LinkModel = mongoose.model('MyLink', LinksSchema); 
module.exports = LinkModel;

router.post('/post_new_link', function( request, response){
	
	try{
		
		var findQuery = { url_title : (request.body.title.replace(/[^a-z0-9\s]/gi, '')).replace(/[_\s]/g, '-') };
		LinkModel.find(findQuery,function(err, MyLink){
			if(MyLink.length == 0) // if url_title available
			{
				var currentDate = new Date();
				var LinkData = {
					owner: request.session.user[0]._id,//request.body.owner,
					language: request.body.language,
					title: request.body.title,
					url_destination : request.body.url_destination,
					lastmodified : currentDate.getTime(),
					upvotes_count : 0,
					downvotes_count : 0,
					url_title: (request.body.title.replace(/[^a-z0-9\s]/gi, '')).replace(/[_\s]/g, '-')
				}
				var redirect_url =(request.body.title.replace(/[^a-z0-9\s]/gi, '')).replace(/[_\s]/g, '-');
				LinkModel.create(LinkData, function (err, MyLink) {
					if (err) {
					  console.log('insert new helpful link err : ' + err);
					  return (err);
					} else {
					  console.log('success, helpful link created.');
					  response.send('/HelpfulLink/' + redirect_url );
						//response.sendStatus(200);
					}
				});// end create
			} // if length 0
			else // url_title taken create record and increment count at the end of the url_title
			{
				var currentDate = new Date();
				var LinkData = {
					owner: request.session.user[0]._id,
					language: request.body.language,
					title: request.body.title,
					url_destination : request.body.url_destination,
					lastmodified : currentDate.getTime(),
					upvotes_count : 0,
					downvotes_count : 0,
					url_title: (request.body.title.replace(/[^a-z0-9\s]/gi, '')).replace(/[_\s]/g, '-') + ( MyLink.length )
				}
				var redirect_url = (request.body.title.replace(/[^a-z0-9\s]/gi, '')).replace(/[_\s]/g, '-') + ( MyLink.length );
				//var io_vars = { from : request.body.marco, to : request.body.polo, message : request.body.messageInfo, marcoName : request.body.marcoName };
				LinkModel.create(LinkData, function (err, MyLink) {
					if (err) {
					  console.log('insert new helpful link err : ' + err);
					  return (err);
					} else {
					  console.log('success, helpful link created.');
					  response.send('/HelpfulLink/' + redirect_url );
					  //response.sendStatus(200);
					}
				});// end create helpful link
			}
		});// first find
			
	}catch(error)
	{
		console.log('insert new helpful link error : ' + error);
	}
	
});

router.post('/delete_link', function( request, response){
	var findQuery = { 
		$and : [
			{_id : request.body.link_id },
			{owner : request.session.user[0]._id }
		]
	};
  	LinkModel.deleteOne(findQuery, function(err, obj) {
		if (err) throw err;
		console.log("one link deleted");
    });
});

router.get('/HelpfulLink/:linkUrl', function( request, response){
	try{
		var title_url = request.params.linkUrl;
		
		LinkModel.find({url_title: title_url},function(err, MyLink){
			MyLink.forEach(function(element){
				
				if (request.session && request.session.user) { //if user logged in
					response.render('pages/HelpfulLink_detailed', {
							link_id : element._id,
							owner : element.owner,
							title : element.title,
							language : element.language,
							url_destination : element.url_destination,
							logged_user : request.session.user[0]._id,
							comments : element.Comments,
							upvotes : element.upvotes.length,
							downvotes : element.downvotes.length
					});
				}
				else
				{
					response.render('pages/HelpfulLink_detailed', {
							link_id : element._id,
							owner : element.owner,
							title : element.title,
							language : element.language,
							url_destination : element.url_destination,
							comments : element.Comments,
							upvotes : element.upvotes.length,
							downvotes : element.downvotes.length
					});
				}
				
			},this);// end User for each	
		});//end .find
		
	
	}catch(error)
	{
		console.log("fetch_link_details error:" + error);
	}
});



router.post('/comment_link', function( request, response){
	
	try{
		
		///find existing link
		var findQuery = { _id : request.body.link_id };
		
		var io_vars = { _id : request.body.link_id, from : request.body.comment_owner, comment_url_destination : request.body.comment_url_destination };
		
		LinkModel.findOne(findQuery,function(err, MyOnlylink){
				var new_values = { 
					$push: { Comments :  {
								from : request.session.user[0]._id,//request.body.comment_owner, 
								comment_index : MyOnlylink.Comments.length,
								comment_url_destination : request.body.comment_url_destination, 
								likes : [],
								dislikes : []  }  
						   } 
				};
				LinkModel.updateOne( findQuery, new_values , { new: true }, function (err, MyLink){
					console.log('comment inserted successfully');
					response.sendStatus(200);
					request.app.io.emit('commentAdded', io_vars);
				});

		});//end .find
			
			
	}catch(error)
	{
		console.log('insert new comment error : ' + error);
	}
	
});




//list links
router.get('/links', function( request, response){ 
	try{
		response.redirect('/links/0');
	}catch(error)
	{
		console.log("links_error:" + error);
	}
	
});

//list my questions
router.get('/my_links', function( request, response){ 
	try{
		if (request.session && request.session.user) {
			
			if(request.session.returnTo)
				delete request.session.returnTo;
			
			response.redirect('/my_links/0');
		}//if logged in
		else
		{
			request.session.returnTo = request.url;
			response.redirect('/login');
		}
	}catch(error)
	{
		console.log("my_links_error:" + error);
	}
	
});


router.get('/my_links/:pageId', function( request, response){

	try{
		
		if (request.session && request.session.user) {
			
				if(request.session.returnTo)
					delete request.session.returnTo;
			
				var page = request.params.pageId;
				var my_limit = 3;
				var skipping = page * my_limit;

				var findQuery = { owner : request.session.user[0]._id };
			
				var sortOption = { lastmodified : -1};

				if(request.query.sortby == 'upvotes')
					sortOption = { upvotes_count : -1};
				if(request.query.sortby == 'downvotes')
					sortOption = { downvotes_count : -1};
			
				var keyword = "";
				if(request.query.keyword)
					keyword = request.query.keyword;


				if(request.query.language) // if query not empty
				{

					findQuery = {
						$and: [
								{ $or: [
									//{ description: { $regex: keyword } },
									{ title: { $regex: keyword }}
								]},
								{ language : request.query.language },
								{ owner : request.session.user[0]._id }
							  ]			  
					};
				}// if query

				LinkModel.find(findQuery,function(err, MyLink){
					total_search_results = MyLink.length;
					total_pages = Math.ceil(total_search_results/my_limit);


					LinkModel.find(findQuery,{},{ skip: skipping, limit: my_limit, sort: sortOption },function(err, MyLink){

						response.render('pages/my_links', {
								links_found : MyLink,
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
		console.log("fetch_my_links error:" + error);
	}
});

//list all links or filter 
router.get('/links/:pageId', function( request, response){

	try{
		
		var page = request.params.pageId;
		var my_limit = 3;
		var skipping = page * my_limit;
		
		var findQuery = {};
		
		var sortOption = { lastmodified : -1};

		if(request.query.sortby == 'upvotes')
			sortOption = { upvotes_count : -1};
		if(request.query.sortby == 'downvotes')
			sortOption = { downvotes_count : -1};
		
		
		var keyword = "";
		if(request.query.keyword)
			keyword = request.query.keyword;
		
		if(request.query.language) // if query not empty
		{
			
			findQuery = {
				$and: [
						{ $or: [
							//{ description: { $regex: keyword } },
							{ title: { $regex: keyword }}
						]},
						{ language : request.query.language }							
					  ]			  
			};
		}// if query
		
		LinkModel.find(findQuery,function(err, MyLink){
			total_search_results = MyLink.length;
			total_pages = Math.ceil(total_search_results/my_limit);
		
		
			LinkModel.find(findQuery,{},{ skip: skipping, limit: my_limit, sort: sortOption },function(err, MyLink){

				response.render('pages/links', {
						links_found : MyLink,
						search_keyword : keyword,
						search_language : request.query.language,
						total_results: total_search_results,
						total_pages : total_pages
				});
			});//find all		
		
		
		});//end .find
		
		
	}catch(error)
	{
		console.log("fetch_links error:" + error);
	}
});





/////// liking disliking Comments


router.post('/like_comment', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.link_id
		};
		var new_values = { 
			//adds a value to an array unless the value is already present
			$addToSet: { 'Comments.$[t].likes' : { liker : request.session.user[0]._id } }//request.body.likers_id
		};
		var io_vars = { link_id : request.body.link_id, comment_index : request.body.comment_index };

		LinkModel.updateOne(findQuery,new_values,{ arrayFilters: [{ "t.comment_index": Number(request.body.comment_index) }], multi: true }, function (err, MyLink){
			console.log('comment liked successfully');
			response.sendStatus(200);
			request.app.io.emit('commentLiked', io_vars);
		});		
	
	
	}catch(error)
	{
		console.log("like_comment error:" + error);
	}
});


router.post('/comment_like_check', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.link_id
		};
		var likes_index_array = new Array();
		LinkModel.findOne(findQuery, function (err, MyLink){
			MyLink.Comments.forEach(function(comment){
				//console.log(comment);
				comment.likes.forEach(function(like){
					if(like.liker == request.session.user[0]._id )//request.body.logged_user
						likes_index_array.push(comment.comment_index);
				},this);// end User for each
			},this);// end User for each
			response.send(likes_index_array);
		});	// end find one	
		
	
	}catch(error)
	{
		console.log("comment_like_check error:" + error);
	}
});



router.post('/unlike_comment', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.link_id
		};
		var new_values = { 
			$pull: { 'Comments.$[t].likes' : { liker : request.session.user[0]._id } }
		};
		var io_vars = { link_id : request.body.link_id, comment_index : request.body.comment_index };
		
		LinkModel.updateOne(findQuery,new_values,{ arrayFilters: [{ "t.comment_index": Number(request.body.comment_index) }], multi: true }, function (err, MyLink){
			console.log('comment unliked successfully');
			response.sendStatus(200);
			request.app.io.emit('commentUnLiked', io_vars);
		});		
	
	
	}catch(error)
	{
		console.log("unlike_comment error:" + error);
	}
});





router.post('/dislike_comment', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.link_id
		};
		var new_values = { 
			//adds a value to an array unless the value is already present
			$addToSet: { 'Comments.$[t].dislikes' : { disliker : request.session.user[0]._id } }//request.body.likers_id
		};
		var io_vars = { link_id : request.body.link_id, comment_index : request.body.comment_index };

		LinkModel.updateOne(findQuery,new_values,{ arrayFilters: [{ "t.comment_index": Number(request.body.comment_index) }], multi: true }, function (err, MyLink){
			console.log('comment disliked successfully');
			response.sendStatus(200);
			request.app.io.emit('commentDisliked', io_vars);
		});		
	
	
	}catch(error)
	{
		console.log("dislike_comment error:" + error);
	}
});


router.post('/comment_dislike_check', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.link_id
		};
		var dislikes_index_array = new Array();
		LinkModel.findOne(findQuery, function (err, MyLink){
			MyLink.Comments.forEach(function(comment){
				//console.log(comment);
				comment.dislikes.forEach(function(dislike){
					if(dislike.disliker == request.session.user[0]._id )//request.body.logged_user
						dislikes_index_array.push(comment.comment_index);
				},this);// end User for each
			},this);// end User for each
			response.send(dislikes_index_array);
		});	// end find one	
		
	
	}catch(error)
	{
		console.log("comment_dislike_check error:" + error);
	}
});


router.post('/undislike_comment', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.link_id
		};
		var new_values = { 
			$pull: { 'Comments.$[t].dislikes' : { disliker : request.session.user[0]._id } }
		};
		var io_vars = { link_id : request.body.link_id, comment_index : request.body.comment_index };
		
		LinkModel.updateOne(findQuery,new_values,{ arrayFilters: [{ "t.comment_index": Number(request.body.comment_index) }], multi: true }, function (err, MyLink){
			console.log('comment undisliked successfully');
			response.sendStatus(200);
			request.app.io.emit('commentUnDisliked', io_vars);
		});		
	
	
	}catch(error)
	{
		console.log("undislike_comment error:" + error);
	}
});

///// upvoting downvoting links

router.post('/upvote_link', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.link_id
		};
		var new_values = { 
			//adds a value to an array unless the value is already present
			$addToSet: { 'upvotes' : { liker : request.session.user[0]._id } }//request.body.likers_id
		};
		var io_vars = { link_id : request.body.link_id };

		LinkModel.updateOne(findQuery,new_values,{ new:true }, function (err, MyLink){
			console.log('link upvoted successfully');
			//response.sendStatus(200);
			request.app.io.emit('linkUpvoted', io_vars);
			
			// cannot sort by arraw length need to store value
			LinkModel.findOne(findQuery, function (err, MyLink){
				LinkModel.updateMany(findQuery,{ upvotes_count : MyLink.upvotes.length, downvotes_count : MyLink.downvotes.length },function (err, MyLink){
				});
				console.log('upvote counted successfully');
				response.sendStatus(200);
			});	
	
			
		});	
		
	
	}catch(error)
	{
		console.log("upvote_link error:" + error);
	}
});


router.post('/link_upvote_check', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.link_id
		};
		var temp_found = false;
		LinkModel.findOne(findQuery, function (err, MyLink){
			MyLink.upvotes.forEach(function(upvote){
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
		console.log("link_upvote_check error:" + error);
	}
});



router.post('/unupvote_link', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.link_id
		};
		var new_values = { 
			$pull: { 'upvotes' : { liker : request.session.user[0]._id } }
		};
		var io_vars = { link_id : request.body.link_id };
		
		LinkModel.updateOne(findQuery,new_values,{ new:true }, function (err, MyLink){
			console.log('link unupvoted successfully');
			//response.sendStatus(200);
			request.app.io.emit('linkUnUpvoted', io_vars);
			
			// cannot sort by arraw length need to store value
			LinkModel.findOne(findQuery, function (err, MyLink){
				LinkModel.updateMany(findQuery,{upvotes_count : MyLink.upvotes.length, downvotes_count : MyLink.downvotes.length },function (err, MyLink){
				});
				console.log('unupvote counted successfully');
				response.sendStatus(200);
			});	
			
		});	
		

	
	
	}catch(error)
	{
		console.log("unupvote_link error:" + error);
	}
});



router.post('/downvote_link', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.link_id
		};
		var new_values = { 
			//adds a value to an array unless the value is already present
			$addToSet: { 'downvotes' : { disliker : request.session.user[0]._id } }//request.body.likers_id
		};
		var io_vars = { link_id : request.body.link_id };

		LinkModel.updateOne(findQuery,new_values,{ new:true }, function (err, MyLink){
			console.log('link downvoted successfully');
			//response.sendStatus(200);
			request.app.io.emit('linkDownvoted', io_vars);
			
			// cannot sort by arraw length need to store value
			LinkModel.findOne(findQuery, function (err, MyLink){
				LinkModel.updateMany(findQuery,{upvotes_count : MyLink.upvotes.length, downvotes_count : MyLink.downvotes.length },function (err, MyLink){
				});
				console.log('downvote counted successfully');
				response.sendStatus(200);
			});				
		});	
		
	
	
	}catch(error)
	{
		console.log("downvote_link error:" + error);
	}
});


router.post('/link_downvote_check', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.link_id
		};
		var temp_found = false;
		LinkModel.findOne(findQuery, function (err, MyLink){
			MyLink.downvotes.forEach(function(downvote){
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
		console.log("link_downvote_check error:" + error);
	}
});



router.post('/undownvote_link', function( request, response){

	try{
		
		var findQuery = { 
				_id : request.body.link_id
		};
		var new_values = { 
			$pull: { 'downvotes' : { disliker : request.session.user[0]._id } }
		};
		var io_vars = { link_id : request.body.link_id };
		
		LinkModel.updateOne(findQuery,new_values,{ new:true }, function (err, MyLink){
			console.log('link undownvoted successfully');
			//response.sendStatus(200);
			request.app.io.emit('linkUnDownvoted', io_vars);
			
			// cannot sort by arraw length need to store value
			LinkModel.findOne(findQuery, function (err, MyLink){
				LinkModel.updateMany(findQuery,{upvotes_count : MyLink.upvotes.length, downvotes_count : MyLink.downvotes.length },function (err, MyLink){
				});
				console.log('undownvote counted successfully');
				response.sendStatus(200);
			});	
			
		});	
	
	}catch(error)
	{
		console.log("undownvote_link error:" + error);
	}
});



const favouritelinks_router = require('./favouritelinks');
var favouritelinkModel = mongoose.model('Myfavouritelink', favouritelinks_router.favouritelinkSchema); 


router.get('/my_favourites', function( request, response){ 
	try{
		response.redirect('/my_favourites/0');
	}catch(error)
	{
		console.log("my_favourites_links_error:" + error);
	}
	
});

router.get('/my_favourites/:pageId', function( request, response){

	try{
			if (request.session && request.session.user) {

					if(request.session.returnTo)
						delete request.session.returnTo;
				
					var linksIDS = new Array();
					favouritelinkModel.findOne({ owner : request.session.user[0]._id },function(err, Myfavouritelink){

						Myfavouritelink.links.forEach(function(element){
							linksIDS.push(element.link_id);
						},this);// end User for each
						
						var page = request.params.pageId;
						var my_limit = 3;
						var skipping = page * my_limit;	
						
						var findQuery = {
							_id: { $in: linksIDS } 
						}
						
						var sortOption = { };

						if(request.query.sortby == 'upvotes')
							sortOption = { upvotes_count : -1};
						if(request.query.sortby == 'downvotes')
							sortOption = { downvotes_count : -1};


						var keyword = "";
						if(request.query.keyword)
							keyword = request.query.keyword;

						if(request.query.language) // if query not empty
						{

							findQuery = {
								$and: [
										{ $or: [
											//{ description: { $regex: keyword } },
											{ title: { $regex: keyword }}
										]},
										{ language : request.query.language },
										{_id: { $in: linksIDS } }
									  ]			  
							};
						}// if query
						
						LinkModel.find(findQuery,function(err, MyLink){
							total_search_results = MyLink.length;
							total_pages = Math.ceil(total_search_results/my_limit);


							LinkModel.find(findQuery,{},{ skip: skipping, limit: my_limit, sort: sortOption },function(err, MyLink){

								response.render('pages/myFavourites', {
										links_found : MyLink,
										search_keyword : keyword,
										search_language : request.query.language,
										total_results: total_search_results,
										total_pages : total_pages
								});
							});//find all		


						});//end .find							
							
							

						
					});	// fetch my favourites
						

				
			}
			else
			{
				request.session.returnTo = request.url;
				response.redirect('/login');
			}		



		
	}catch(error)
	{
		console.log("my_favourites error:" + error);
	}
});


module.exports = router;
