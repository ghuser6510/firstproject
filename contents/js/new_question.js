$(document).ready(function(){
	
	
	$(".post_question").bind('touchstart click', function(){
		PostMyQuestion();
	});
	
	PostMyQuestion = function()
	{
		//resetting
		$(".question_title").removeClass('error_class');
		$(".new_msg_text").removeClass('error_class');
		$(".input-language-tags").removeClass('error_class');
		var form_validated = true;
		
		if( $(".question_title").val().length == 0)
		{
			$(".question_title").addClass('error_class');
			form_validated = false;	
		}//title not empty
		
		if( $(".new_msg_text").val().length == 0)
		{
			$(".new_msg_text").addClass('error_class');
			form_validated = false;	
		}//description not empty
		
		if( $(".input-language-tags").val().length == 0)
		{
			$(".input-language-tags").addClass('error_class');
			form_validated = false;	
		}//language not empty
		
		if(form_validated){
			var questionInfo = new Object();
			questionInfo.owner = $(".question_form").attr('marco');
			questionInfo.language = $(".input-language-tags").val();
			questionInfo.title = $(".question_title").val();
			questionInfo.description = $(".new_msg_text").val();
			PostQuestion(questionInfo);
		}
		
	}// end Submit function
	
	
	function PostQuestion(questionInfo){
		$.ajax({
		  type: "POST",
		  url: "/post_new_question",
		  data: questionInfo,
		  success: function(msg){
				//alert( msg );
			  window.location.assign(msg);
		  }// end post success
		});
	}// end function PostQuestion
	
	
	SetLanguagesSelect = function(my_languages){
		$('.input-language-tags').selectize({
			maxItems: 1,
			valueField: 'language',
			labelField: 'language',
			searchField: 'language',
			options: my_languages,
			create: false,
			sortField: 'text'
		});
	}
	
	//var my_languages;
	function GetLanguages(){
		$.ajax({
		  type: "GET",
		  url: "/languages_list",
		  success: function(msg){
				//my_languages = msg;
				SetLanguagesSelect(msg);
				//console.log(msg);
		  }// end post success
		});
	}// end function LoginUser
	GetLanguages();
	
});//$(document).ready(function()

