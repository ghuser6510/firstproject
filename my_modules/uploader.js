const express = require('express');  //npm install -s express
const multer = require('multer');
const path = require('path');


var router = express.Router();


// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './contents/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage'); //myImage name of the field in the frontend

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}


router.post('/upload_single_image', function( req, res){
  try{
	  upload(req, res, function (err) {
		if(err){
		  res.send('error: ' + err);
		} else {
		  if(req.file == undefined){
			res.send('Error: No File Selected!');
		  } else {
			  res.send('Success:uploads/' + req.file.filename);
		  }
		}
	  });
  }catch(error)
	{
		console.log("upload_single_image_error:" + error);
	}
  
});




module.exports = router;
