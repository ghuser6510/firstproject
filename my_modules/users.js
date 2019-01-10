const express = require('express');  //npm install -s express
var mongoose = require('mongoose');//npm install -s mongoose
var session = require('express-session');//npm install -s express-session
var NArray = require('node-array'); //npm install -s node-array
//must install bcrypt to hash a password before saving it to the database.
//var bcrypt = require('bcrypt');//npm install -s bcrypt
var languages = require('language-list')(); //npm install -s language-listn

// cookieParser req.sessionID
var cookieParser = require('cookie-parser'); //npm install -s cookie-parser


var router = express.Router();

router.use(cookieParser());


var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  username: {
    type: String,
	unique: true,
    required: true
  },
   password: {
    type: String,
    required: true
  },
   country: {
    type: String,
    required: false
  },
  country_name: {
    type: String,
    required: false
  },
   cities:{
    type: Array,
    required: false
  },
   native_languages: {
    type: Array,
    required: false
  },
   sought_languages: {
    type: Array,
    required: false
  },
   interests: {
    type: Array,
    required: false
  },
   about_me: {
    type: String,
    required: false
  },
   profile_pic: {
    type: String,
    required: false
  },
  is_private: {
    type: Boolean,
    required: false
  },
  lastactive: {
    type: String,
    required: true
  }
});


var UserModel = mongoose.model('MyUser', UserSchema); // User name of the table bel mlab
module.exports = UserModel;

/*
//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});
*/
//var datetime = new Date();
//datetime = datetime.getFullYear() +"/"+ datetime.getMonth() +"/"+ datetime.getDate(); //months from 0 to 11 rememmber to add 1
//console.log(datetime);

// /students/:studentId/addEvent/:eventName dynamic paramters 
// /new_user_signup/:eventName (eventName must be matched in the requested params)
//receive data from the front end 
router.post('/new_user_signup', function( request, response){
	//var blabla = request.params.eventName
	//var studentId = request.params.studentId
	try{
		var my_firstname = (request.body.firstname.replace(/[^a-z0-9\s]/gi, '')).replace(/[_\s]/g, '-');
		var my_lastname = (request.body.lastname.replace(/[^a-z0-9\s]/gi, '')).replace(/[_\s]/g, '-');
		var my_username = my_firstname +  my_lastname;
		
		var findQuery = { username : my_username };
		
		UserModel.find(findQuery,function(err, MyUser){
			if(MyUser.length == 0) // if username available
			{
					var currentDate = new Date();
					var userData = {
						email: request.body.email.toLowerCase(),
						firstname: request.body.firstname,
						password: request.body.password,
						lastname : request.body.lastname,
						username : my_username,
						is_private : false,
						lastactive : currentDate.getTime()
					}
					//use schema.create to insert data into the db - User is the name of the module created
					
					
					UserModel.create(userData, function (err, user) {
						if (err) {
						  console.log(err);
						  if( err.code == 11000)//11000 = duplicate, only email unique
						  {	
							console.log('Email already in use.');
							response.send('Email already in use.');
						  }// if email not unique
						  return (err);
						} else {
						  //return response.redirect('/profile');
						  console.log('success, user created.');
						  response.sendStatus(200);
						}
					});
							
				
			}// if username available
			else
			{
					var currentDate = new Date();
					var userData = {
						email: request.body.email.toLowerCase(),
						firstname: request.body.firstname,
						password: request.body.password,
						lastname : request.body.lastname,
						username : my_username +  MyUser.length ,
						is_private : false,
						lastactive : currentDate.getTime()
					}
					//use schema.create to insert data into the db - User is the name of the module created
					
					
					UserModel.create(userData, function (err, user) {
						if (err) {
						  console.log(err);
						  if( err.code == 11000)//11000 = duplicate, only email unique
						  {	
							console.log('Email already in use.');
							response.send('Email already in use.');
						  }// if email not unique
						  return (err);
						} else {
						  //return response.redirect('/profile');
						  console.log('success, user created.');
						  response.sendStatus(200);
						}
					});
							
				
			}
		});// first find
		
		//console.log(request.body);
	}catch(error)
	{
		console.log("new_user_signup:" + error);
	}
	
});

////// adding sessions when logging-in
router.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false
}));

////// login
router.post('/my_user_login', function( request, response){

	try{
		//.find will return an array findOne will return an object
		UserModel.find({email:request.body.email.toLowerCase()},function(err, MyUser){
			
			
			if (err) {
			  //console.log(err);
			  return (err);
			} else {
				
				if( MyUser.length == 0 )
				{
					response.send('Username not found.');	
					console.log('Username not found.');
				}
				else{
				  //return response.redirect('/profile');
				  MyUser.forEach(function(element){
					if ( request.body.password == element.password)
					{
						request.session.user = MyUser;
						if(request.session.returnTo)
							response.send(request.session.returnTo); //redirect from front-end
						else
							response.send('/');
						
						
						////update last login 	
						var myquery = { email: request.body.email };
						var currentDate = new Date();
						var newvalues = {
							lastactive : currentDate.getTime()
						}
						UserModel.updateOne(myquery, newvalues, function(err, res) {
							if (err) throw err;
							console.log("user last login updated");
						});
					
					
					}
					else
						response.send('Wrong username or password.');
				  },this);// end User for each
				}//  if user found
				
			}// if no error
		});
		
		// testing decrypting hashed password
		/*
		UserModel.find({},function(err, MyUser){
			//sending the info to the front-end	
			////response.send(User);
			MyUser.forEach(function(element){
				var stored_hash = element.password;
				var guess = '123';
				bcrypt.compare(guess, stored_hash, function(err, res) {
					console.log(res); // true if correct
				});
				response.send(MyUser);	
			},this);// end User for each
		});
		*/
		
		//response.send(messagesArray);
		
	}catch(error)
	{
		console.log("my_user_login:" + error);
	}
});





router.post('/updateuser', function( request, response){
	var loggedin_user = request.session.user[0].email;
	var myquery = { email: loggedin_user };
	
	var mcities = new Array();
	for(var i = 0;i< request.body.cities.split(',').length ;i++)
	{
		mcities.push({ city:request.body.cities.split(',')[i] });
	}
	
	var nlanguages = new Array();
	for(var i = 0;i< request.body.native_languages.split(',').length ;i++)
	{
		nlanguages.push({ native_language:request.body.native_languages.split(',')[i] });
	}
	
	var slanguages = new Array();
	for(var i = 0;i< request.body.sought_languages.split(',').length ;i++)
	{
		slanguages.push({ sought_language:request.body.sought_languages.split(',')[i] });
	}
	
	var minterests = new Array();
	for(var i = 0;i< request.body.interests.split(',').length ;i++)
	{
		minterests.push({ interest:request.body.interests.split(',')[i] });
	}
	
	var currentDate = new Date();
	var newvalues = {
		cities : mcities,
		country : request.body.country,
		country_name : request.body.country_name,
		native_languages : nlanguages,
		sought_languages : slanguages,
		interests : minterests,
		about_me : request.body.about_me,
		profile_pic : request.body.profile_pic,
		lastactive : currentDate.getTime()
	}
	//console.log(request.body.about_me);
	try{
		UserModel.updateOne(myquery, newvalues, function(err, res) {
			if (err) 
				throw err;
			else
			{
				console.log("user info updated");
				//must refresh the session with the new
				
				UserModel.find({email:request.session.user[0].email},function(err, MyUser){
					MyUser.forEach(function(element){
						request.session.user = MyUser;
						//save the new session info to the store
						request.session.save(function(err) {
						   console.log('user session updated');
						});
					},this);// end User for each
				});
				/* //find one didn't work bcuz on login we used find which returned an array and we looped through the array for info, fineone no array error finding info
				UserModel.findOne({email: request.session.user[0].email}, function(err,MyUser) { 
					if (err)
						console.log(err);
					else
					{
						//delete request.session.user;
						request.session.user = MyUser;
						request.session.save(function(err) {
						   console.log('user session updated');
						});
						
						//console.log("iside user: " + request.sessionID);
						//console.log(request.session.user);
					}//if err
				});//findeone
				*/
			}//if err
		});//update one
		
		if( request.body.password != null)
		{
			var newvalues = {
				password : request.body.password
			}
			UserModel.updateOne(myquery, newvalues, function(err, res) {
				if (err) 
					throw err;
				else
				{
					console.log("user password updated");
				}
			});
			
		}// if change password requested
		
		/* search for user who have selected the city edna
		UserModel.find({cities: { city: 'Edna' } },function(err, MyUser){
			MyUser.forEach(function(element){
				console.log('user found:' + element.email);
			},this);// end User for each
		});
		*/
		
		response.send('user updated');
		
	}catch(error)
	{
		console.log("updateuser_catch:" + error);
	}
	
});

/////logout
router.get('/logout', function(req, res, next) {
  
	try{
	  if (req.session) {
		// delete session object
		req.session.destroy(function(err) {
		  if(err) {
			return next(err);
		  } else {
			return res.redirect('/login');
		  }
		});
	  }
	}catch(error)
	{
		console.log("logout:" + error);
	}

});


//find partner
router.get('/find_partner', function( request, response){ 
	try{
		response.redirect('/find_partner/0');
	}catch(error)
	{
		console.log("find_partner_error:" + error);
	}
	
});

var  total_search_results = 0;
router.get('/find_partner/:pageId', function( request, res){ 
	try{
		var page = request.params.pageId;
		var my_limit = 2;
		var skipping = page * my_limit;
		//console.log(request.query);
		//var myquery = request.query;
		//{ $cond: [ <boolean-expression>, <true-case>, <false-case> ] }
		var myquery = {};
		
		if(request.query.country)
			myquery.country = request.query.country
		
		//var and_options = new Array();
		//var or_options = new Array();
		
		if(request.query.cities)
		{
			var temp = (request.query.cities).split(",");
			if(temp.length > 1)
			{
				var temp_ar_citites = new Array();
				for(var i = 0; i<temp.length;i++)
					temp_ar_citites.push({'city':temp[i]});
				myquery.cities = temp_ar_citites;
			}
			else
				myquery.cities = {'city':temp[0]};
		}
		
		
		if(request.query.sought_languages)
		{
			var temp = (request.query.sought_languages).split(",");
			if(temp.length > 1)
			{
				var temp_ar_languages = new Array();
				for(var i = 0; i<temp.length;i++)
					temp_ar_languages.push({'native_languages.native_language':temp[i]});
				myquery.native_languages = temp_ar_languages;
			}
			else
				myquery.native_languages = {'native_language':temp[0]};
		}
		
		if(request.query.interests)
		{
			var temp = (request.query.interests).split(",");
			if(temp.length > 1)
			{
				var temp_ar_interests = new Array();
				for(var i = 0; i<temp.length;i++)
					temp_ar_interests.push({'interests.interest':temp[i]});
				myquery.interests = temp_ar_interests;
			}
			else
				myquery.interests = {'interest':temp[0]};
		}
		
		//$or:[{'cities.city': "Tripoli"},{'cities.city':"Beirut"}]
		//console.log(myquery);
		
		//roger118118
		
		var requested_country;
		if( request.query.country)
			requested_country = request.query.country;
		else
			requested_country = 'US'; // we will detect country once online.
			
		//var myquery = {};
		//var myquery = {$or:[{region: "NA"},{sector:"Some Sector"}]}; with or
		UserModel.find(myquery,function(err, MyUser){
			total_search_results = MyUser.length;
			total_pages = Math.ceil(total_search_results/my_limit);
			//console.log(total_results);
		
			UserModel.find(myquery, {},{ skip: skipping, limit: my_limit, sort: {lastactive: -1} },function(err, MyUser){
				res.render('pages/find_partner', {
					users_found: MyUser,
					total_results: total_search_results,
					total_pages : total_pages,
					requested_country : requested_country,
					requested_cities : request.query.cities,
					requested_languages : request.query.sought_languages,
					requested_interests : request.query.interests
				});
			});//end .find
		
		});//end .find
		
		
		
		
	}catch(error)
	{
		console.log("find_partner_error:" + error);
	}
	
});


router.get('/profile/:profileId', function( request, res){ 
	try{
		var profileId = request.params.profileId;
		UserModel.find({username: profileId },function(err, MyUser){
			MyUser.forEach(function(element){
				//console.log('user found:' + element.email);
				res.render('pages/view_profile', {
					users_found : MyUser
				});
			},this);// end User for each
		});//end find
		
	}catch(error)
	{
		console.log("view_profile_error:" + error);
	}
});


router.post('/request_polos_name', function( request, response){
	try{
		UserModel.find({_id:request.body.polo},function(err, MyUser){
			if (err) {
			  //console.log(err);
			  return (err);
			} else {
				  MyUser.forEach(function(element){
					response.send({
						firstname : element.firstname,
						profile_pic : element.profile_pic,
						username : element.username
					});
				  },this);// end User for each
			}// if no error
		});
		
		
	}catch(error)
	{
		console.log("request_polos_name:" + error);
	}
});



module.exports = router;
