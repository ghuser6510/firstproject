$(document).ready(function(){
	
	
	function validateEmail($email) {
	  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	  return emailReg.test( $email );
	}
	
	$(".login_submit").bind('touchstart click', function(){
		SubmitLoginForm();
	});
	
	
	SubmitLoginForm = function()
	{
		
		//resetting
		$(".login_email").removeClass('FormInputError');
		$(".login_password").removeClass('FormInputError');
		
		
		var form_validated = true;
		//front-end email validation
		var emailaddress = $(".login_email").val();
		if( !validateEmail(emailaddress) || $(".login_email").val() == "" ) { 
			$(".login_email").addClass('FormInputError');
			form_validated = false;
		}
		//front-end password validation
		if( $(".login_password").val() == "" ) { 
			$(".login_password").addClass('FormInputError');
			form_validated = false;
		}
		
		if(form_validated)
		{
			
			var LoginInfo = {
					email: $(".login_email").val(), 
					password: $(".login_password").val()
			};
			LoginUser(LoginInfo);
			//alert(TestUser);
		}
		else
		{
			//alert("no");	
		}
		
		
	}// end Submit function
	
	
	function LoginUser(userInfo){
		$.ajax({
		  type: "POST",
		  url: "/my_user_login",
		  data: userInfo,
		  success: function(msg){
				if( msg == "Username not found.")
				{
					alert( msg );
				}
				else if( msg == "Wrong username or password.")
				{
					alert( msg );
					$(".login_email").addClass('FormInputError');
					$(".login_password").addClass('FormInputError');
				}
				else //loggedin successfully
				{
					window.location.href = msg;
					//alert( msg );
				}
		  }// end post success
		});
	}// end function LoginUser

	
});//$(document).ready(function()

