$(document).ready(function(){
	
	
	$(".post_link").bind('touchstart click', function(){
		PostMyLink();
	});
	
	const isValidUrl = (string) => {
	  try {
		new URL(string);
		return true;
	  } catch (_) {
		return false;  
	  }
	}

	PostMyLink = function()
	{
		//resetting
		$(".link_title").removeClass('error_class');
		$(".link_url").removeClass('error_class');
		$(".input-language-tags").removeClass('error_class');
		$(".url_err").text("");
		var form_validated = true;
		
		if( $(".link_title").val().length == 0)
		{
			$(".link_title").addClass('error_class');
			form_validated = false;	
		}//title not empty
		
		if( $(".link_url").val().length == 0)
		{
			$(".link_url").addClass('error_class');
			form_validated = false;	
		}//url destination not empty
		
		if ( !isValidUrl($(".link_url").val()))
		{
			$(".link_url").addClass('error_class');
			$(".url_err").text("Please enter a valid url");
			form_validated = false;	
		}//url destination is not a url

		
		if( $(".input-language-tags").val().length == 0)
		{
			$(".input-language-tags").addClass('error_class');
			form_validated = false;	
		}//language not empty
		
		if(form_validated){
			var LinkInfo = new Object();
			//questionInfo.owner = $(".question_form").attr('marco');
			LinkInfo.language = $(".input-language-tags").val();
			LinkInfo.title = $(".link_title").val();
			LinkInfo.url_destination = $(".link_url").val();
			PostLink(LinkInfo);
		}
		
	}// end Submit function
	
	
	function PostLink(LinkInfo){
		$.ajax({
		  type: "POST",
		  url: "/post_new_link",
		  data: LinkInfo,
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

