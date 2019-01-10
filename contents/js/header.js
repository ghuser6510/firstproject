$(document).ready(function(){
	
	
	$(".submit_suggestion").bind('touchstart click', function(){
		SubmitSuggestion();
	});
	
	
	SubmitSuggestion = function()
	{
		$(".suggestion_text").removeClass('error_class');
		
		if( $(".suggestion_text").val().length > 0)
		{
			var SuggestionInfo = new Object();
			//SuggestionInfo.from = $(".suggestion_box").attr('marco');
			//SuggestionInfo.username = $(".suggestion_box").attr('username');
			SuggestionInfo.description = $(".suggestion_text").val();
			PostSuggestion(SuggestionInfo);
			$('.suggestion_text').val('');
			$('.suggestion_text').text('');
		}//if chatbox message not empty
		else
			$(".suggestion_text").addClass('error_class');
		
		
	}// end Submit function
	
	
	function PostSuggestion(SuggestionInfo){
		$.ajax({
		  type: "POST",
		  url: "/add_new_suggestion",
		  data: SuggestionInfo,
		  success: function(msg){
					alert( msg );
		  }// end post success
		});
	}// end function LoginUser

	
});//$(document).ready(function()

