var express = require('express');  //npm install -s express
var bodyParser = require('body-parser');//npm install -s body-parser
var app = express();
var http = require('http').Server(app); // added that for socket.io
var io = require('socket.io')(http); //npm install -s socket.io
var mongoose = require('mongoose');//npm install -s mongoose
const cities = require('cities.json'); //npm install -s cities.json
var languages = require('language-list')(); //npm install -s language-listn
var requestCountry = require('request-country'); //npm install -s request-country
//var interests = require('interest-list')(); //npm install -s interest-list
//var NArray = require('node-array'); //npm install -s node-array

// cookieParser req.sessionID
var cookieParser = require('cookie-parser'); //npm install -s cookie-parser
const ejs = require('ejs');

//adding sessions
var session = require('express-session');//npm install -s express-session

app.io = io;//so we can call io inside routers 


app.use(express.static("contents"));
app.use(express.static("views"));
app.use(bodyParser.json()); // parse incoming data from the front end to JSON 
app.use(bodyParser.urlencoded({extended:false})); // need to set that so we can receive data from the front-end

app.use(cookieParser());
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: true,
    saveUninitialized: true,
	rolling: true,
    cookie: {
        expires: 600000
    }
}));

//console.log(interests.getData());

//mongo db model
/*
var MyModel = mongoose.model('MyModuleName', { //name sorting the models in the mongo db
	name:String,
	says:String	
});


// test server array will change that to read and write to database
var messagesArray = [
	{name: 'Tim', says: 'Hi'},
	{name: 'Jane', says: 'Hello'}
]
*/

///mlab al.akl ihateuall!11


// EJS
app.set('view engine', 'ejs');


// mlab.com db connection must hide this in a configuration file
var dbUrl = 'mongodb://user:user123@ds115244.mlab.com:15244/learning-node'
//connecting to mongoose
mongoose.connect(dbUrl, {useCreateIndex: true, useNewUrlParser: true},function(err,data){
	console.log('mongo db connection', err);
});


app.get('/cities_list', function( request, response){
	response.send(cities);
});
app.get('/languages_list', function( request, response){
	response.send(languages.getData());
});
/*
app.get('/interests_list', function( request, response){
	var temp_interests = interests.getData();
	var my_interests_options = [];
	for(var i = 0; i<temp_interests.length;i++)
	{
		var myObject = new Object();
		myObject.name = temp_interests[i];
		my_interests_options.push( myObject);	
	}	response.send(my_interests_options);
});
*/

////// signup login
const signup_router = require('./my_modules/users.js');
app.use(signup_router);
/*
app.get('/signup', function( request, response){
	response.sendFile('signup.html', { root: 'public' });
});

app.get('/login', function( request, response){
	response.sendFile('login.html', { root: 'public' });
});
*/
app.get('/signup', function( request, res){ 
	try{
		res.render('pages/signup', {
			//marcoId: request.session.user[0]._id,
			//marcoName: request.session.user[0].firstname,
		});
			
	}catch(error)
	{
		console.log("login_error:" + error);
	}
	
});

app.get('/login', function( request, res){ 
	try{
		res.render('pages/login', {
			//marcoId: request.session.user[0]._id,
			//marcoName: request.session.user[0].firstname,
		});
			
	}catch(error)
	{
		console.log("login_error:" + error);
	}
	
});


function requiresLogin(request, response, next) {
  try{		
	  if (request.session && request.session.user) {
		return next();
	  } else {
		var err = new Error('You must be logged in to view this page.');
		err.status = 401;
		request.session.returnTo = request.url;
		response.redirect('/login');
		//response.sendFile('login.html', { root: 'public' });
	  }
  }catch(error){
	 console.log("function requiresLogin:" + error); 
  }
	  
}//enf function requiresLogin
/*
app.get('/must_be_loggedin',requiresLogin, function(request, response, next) {
	if(request.session.returnTo)
		delete request.session.returnTo;
	response.send('welcome');
});


// if loggedin return the user info else return loggedout
app.get('/check_if_loggedin', function(request, response) {
	try{
		if (request.session && request.session.user) 
			response.send(request.session.user);
		else
			response.send('logged_out');
	}catch(error)
	{
		console.log("check_if_loggedin:" + error);
	}
});
*/

const suggestions_router = require('./my_modules/suggestions.js');
app.use(suggestions_router);

const interests_router = require('./my_modules/interests.js');
app.use(interests_router);

const favouritelinks_router = require('./my_modules/favouritelinks.js');
app.use(favouritelinks_router);


/* //old serving html instead of view
app.get('/edit_profile', function( request, response){
	response.sendFile('edit_profile.html', { root: 'public' });
});
*/
app.get('/edit_profile',requiresLogin, function( request, res){ 
	try{
		if(request.session.returnTo)
			delete request.session.returnTo;
		//console.log(requestCountry(request)); must be online need ip to detect country
		
		res.render('pages/edit_profile', {
			logged_user: request.session.user[0].email,
			logged_country: request.session.user[0].country,
			logged_cities: request.session.user[0].cities,
			logged_native_languages: request.session.user[0].native_languages,
			logged_sought_languages: request.session.user[0].sought_languages,
			logged_interests: request.session.user[0].interests,
			logged_about_me: request.session.user[0].about_me,
			logged_profile_pic: request.session.user[0].profile_pic
		});
	}catch(error)
	{
		console.log("edit_profile_error:" + error);
	}
});

const messages_router = require('./my_modules/messages.js');
app.use(messages_router);

app.get('/messages/:poloId',requiresLogin, function( request, res){ 
	try{
		if(request.session.returnTo)
			delete request.session.returnTo;
		//console.log(requestCountry(request)); must be online need ip to detect country
		//if i'm trying to send myself a msg only view my profile
		if( request.session.user[0]._id == request.params.poloId)
		{
			res.redirect('/profile/' + request.session.user[0].username );
			//console.log('me me me');
		}
		else
		{
			res.render('pages/messages', {
				marcoId: request.session.user[0]._id,
				marcoName: request.session.user[0].firstname,
				poloId : request.params.poloId
			});
		}
			
	}catch(error)
	{
		console.log("messages_error:" + error);
	}
	
});

app.get('/messages', requiresLogin, function( request, res){ 
	try{
		if(request.session.returnTo)
			delete request.session.returnTo;
		//console.log(requestCountry(request)); must be online need ip to detect country
		//if i'm trying to send myself a msg only view my profile
		res.render('pages/inbox', {
			marcoId: request.session.user[0]._id,
			marcoName: request.session.user[0].firstname,
		});
			
	}catch(error)
	{
		console.log("messages_error:" + error);
	}
	
});


const questions_router = require('./my_modules/questions.js');
app.use(questions_router);

app.get('/ask_question', requiresLogin, function( request, res){ 
	try{
		if(request.session.returnTo)
			delete request.session.returnTo;
		//console.log(requestCountry(request)); must be online need ip to detect country
		//if i'm trying to send myself a msg only view my profile
		res.render('pages/new_question', {
			marcoId: request.session.user[0]._id
		});
			
	}catch(error)
	{
		console.log("messages_error:" + error);
	}
	
});





const links_router = require('./my_modules/links.js');
app.use(links_router);

app.get('/post_helpful_link', requiresLogin, function( request, res){ 
	try{
		if(request.session.returnTo)
			delete request.session.returnTo;
		//console.log(requestCountry(request)); must be online need ip to detect country
		//if i'm trying to send myself a msg only view my profile
		res.render('pages/post_link', {
			marcoId: request.session.user[0]._id
		});
			
	}catch(error)
	{
		console.log("post_link:" + error);
	}
	
});








/*
//receive data from the front end 
app.post('/messages', function( request, response){
	  	
	//console.log(request.body);
	response.sendStatus(200);
	
	//custom sokcet io event must be called inside a function
	// after receiving info form a front-end connection, the server will push it now to all the front-end connections with socket.io
	//io.emit('myCustomEvent', messagesArray);
});
*/


const uploader_router = require('./my_modules/uploader.js');
app.use(uploader_router);



//learn io events, this is on connection event
io.on('connection', function(socket){
	console.log("socket io user connected");
});


/*
////frinks demo, looping for prodctus etc..
app.get('/drinks', function(req, res) {
    var drinks = [
        { name: 'Bloody Mary', drunkness: 3 },
        { name: 'Martini', drunkness: 5 },
        { name: 'Scotch', drunkness: 10 }
    ];
    var tagline = "Any code of your own that you haven't looked at for six or more months might as well have been written by someone else.";

    res.render('pages/drinks', {
        drinks: drinks,
        tagline: tagline
    });
});
*/
app.get('/', (req, res) => {//homepage represented by the single slash
  	
	if (req.session && req.session.user)
		{
			res.render('pages/index', {
				logged_user : req.session.user[0]._id,
				logged_username : req.session.user[0].username
			});
		}
	else
		res.render('pages/index');	
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.status(404).send('what???')	
});

//app.listen(3000); // we use app.listen without socket
http.listen(3000);