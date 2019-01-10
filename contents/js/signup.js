$(document).ready(function(){
	
	
	function validateEmail($email) {
	  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	  return emailReg.test( $email );
	}
	
	$(".signup_submit").bind('touchstart click', function(){
		SubmitSignupForm();
	});
	
	
	SubmitSignupForm = function()
	{
		
		//resetting
		$(".signup_confirmpassword_span").text("");
		$(".signup_email").removeClass('FormInputError');
		$(".signup_firstname").removeClass('FormInputError');
		$(".signup_lastname").removeClass('FormInputError');
		$(".signup_password").removeClass('FormInputError');
		$(".signup_confirmpassword").removeClass('FormInputError');
		
		
		var form_validated = true;
		//front-end email validation
		var emailaddress = $(".signup_email").val();
		if( !validateEmail(emailaddress) || $(".signup_email").val() == "" ) { 
			$(".signup_email").addClass('FormInputError');
			form_validated = false;
		}
		
		//front-end first validation
		if( $(".signup_firstname").val() == "" ) { 
			$(".signup_firstname").addClass('FormInputError');
			form_validated = false;
		}
		
		//front-end last validation
		if( $(".signup_lastname").val() == "" ) { 
			$(".signup_lastname").addClass('FormInputError');
			form_validated = false;
		}
		
		//front-end confrimpassword validation
		if( ( $(".signup_password").val() != $(".signup_confirmpassword").val()) || $(".signup_confirmpassword").val() == "" || $(".signup_password").val() == "" ) { 
			$(".signup_password").addClass('FormInputError');
			$(".signup_confirmpassword").addClass('FormInputError');
			if ( $(".signup_password").val() != $(".signup_confirmpassword").val() )
				$(".signup_confirmpassword_span").text("Password - Confirm pass missmatch");
			form_validated = false;
		}
		
		if(form_validated)
		{
			
			var TestUser = {
					email: $(".signup_email").val(), 
					firstname: $(".signup_firstname").val(), 
					lastname: $(".signup_lastname").val(), 
					password: $(".signup_password").val()
			};
			SignupNewUser(TestUser);
			//alert(TestUser);
		}
		else
		{
			//alert("no");	
		}
		
		
	}// end Submit function
	
	
	function SignupNewUser(userInfo){
		//$.post('/new_user_signup', userInfo ); // can only send 1 message at the time and not an array
		$.ajax({
		  type: "POST",
		  url: "/new_user_signup",
		  data: userInfo,
		  success: function(msg){
				if( msg == "Email already in use.")
				{
					alert( msg );
					$(".signup_email").addClass('FormInputError');
				}
				else if( msg == "OK")
				{
					alert( msg );
				}
		  }// end post success
		});
		
		
	}// end function postMessages

	
});//$(document).ready(function()

