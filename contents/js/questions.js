$(document).ready(function(){
	
	
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
	
	function GetPolosName(arg,index){
		$.ajax({
		  type: "POST",
		  url: "/request_polos_name",
		  data: { "polo" : arg},
		  success: function(msg){
		  	$(".owner_name").eq(index).text(msg.firstname);
			$(".owner_pic").eq(index).text(msg.profile_pic);
		  }// end post success
		});
	}// end function LoginUser
	
	$( ".question_item" ).each(function( index ) {
		GetPolosName( $(this).find('.owner_id').text(),index);
	});
	
	
	$(".search_button").bind('touchstart click', function(){
		SearchMyQuestions();
	});
	
	$(".sort_upvotes").bind('touchstart click', function(){
		var current_location = $(location).attr('href');
		if(current_location.indexOf('sortby') == -1 )
		{
			if(current_location.indexOf('?') == -1 )
				window.location.assign("?sortby=upvotes");
			else
				window.location.href = (current_location + "&sortby=upvotes");
		}
		else{
			current_location = current_location.replace('sortby=upvotes','sortby=upvotes');
			current_location = current_location.replace('sortby=downvotes','sortby=upvotes');
			window.location.href = current_location;
		}
		
	});	
	
	$(".sort_downvotes").bind('touchstart click', function(){
		var current_location = $(location).attr('href');
		if(current_location.indexOf('sortby') == -1 )
		{
			if(current_location.indexOf('?') == -1 )
				window.location.assign("?sortby=downvotes");
			else
				window.location.href = (current_location + "&sortby=downvotes");
		}
		else{
			current_location = current_location.replace('sortby=upvotes','sortby=downvotes');
			current_location = current_location.replace('sortby=downvotes','sortby=downvotes');
			window.location.href = current_location;
		}
	
	
	});	
	
	$(".sort_recent").bind('touchstart click', function(){
		var current_location = $(location).attr('href');
		current_location = current_location.replace('&sortby=upvotes','');
		current_location = current_location.replace('&sortby=downvotes','');
		current_location = current_location.replace('?sortby=upvotes','');
		current_location = current_location.replace('?sortby=downvotes','');		
		window.location.href = current_location;
	});
	
	
	SearchMyQuestions = function(){
		//resetting
		$(".search_input").removeClass('error_class');
		$(".input-language-tags").removeClass('error_class');
		var form_validated = true;
		
		/*
		if( $(".search_input").val().length == 0)
		{
			$(".search_input").addClass('error_class');
			form_validated = false;	
		}//search not empty
		*/
		
		if( $(".input-language-tags").val().length == 0)
		{
			$(".input-language-tags").addClass('error_class');
			form_validated = false;	
		}//language not empty
		
		if(form_validated){
			
			var current_location = $(location).attr('href');
			current_location = current_location.substring(0, current_location.indexOf('questions/'));
			
			var destination = current_location + "questions/0";
			destination += "?language=" + $(".input-language-tags").val() + "&keyword=" + $(".search_input").val();
			window.location.href = destination;
		}
		
		
	}//SearchMyQuestions

	$(".edit_question").bind('touchstart click', function(){
		EditQuestion($(".edit_question").index($(this)));
		$(this).css({"display":"none"});
	});	
	$(".save_question").bind('touchstart click', function(){
		SaveQuestion($(".save_question").index($(this)));
		$(this).css({"display":"none"});
	});	
	
	EditQuestion = function(arg){
		var temp_html = $(".description_holder").eq(arg).find(".question_description").val();
		$(".description_holder").eq(arg).removeClass('item_locked');
		$(".description_holder").eq(arg).empty();
		$(".description_holder").eq(arg).append('<textarea class="question_description form-control textarea-control" data-emojiable="true" >'+temp_html+'</textarea>');
		SetEmojis();//in the view
		$(".save_question").eq(arg).css({"display":"block"});
	}
	
	SaveQuestion = function(arg){
		var temp_html = $(".description_holder").eq(arg).find(".question_description").val();
		$(".description_holder").eq(arg).addClass('item_locked');
		$(".description_holder").eq(arg).empty();
		$(".description_holder").eq(arg).append('<textarea class="question_description form-control textarea-control emoji_disabled" data-emojiable="true" >'+temp_html+'</textarea>');
		SetEmojis();//in the view
		$(".edit_question").eq(arg).css({"display":"block"});
		var NewQuestionInfo = new Object();
		NewQuestionInfo.question_id = $(".question_item").eq(arg).attr('question_id');
		NewQuestionInfo.description = $(".description_holder").eq(arg).find(".question_description").val();
		UpdateQuestion(NewQuestionInfo);
	}
	
	function UpdateQuestion(NewQuestionInfo){
		$.ajax({
		  type: "POST",
		  url: "/update_question",
		  data: NewQuestionInfo,
		  success: function(msg){
			  alert("question updated successfully");
		  }// end post success
		});
	}// end function UpdateQuestion
	
	//onclick="return confirm('Are you sure?');"
	$(".delete_question").bind('touchstart click', function(){
		if(confirm('Are you sure?'))
		{
			var NewQuestionInfo = new Object();
			NewQuestionInfo.question_id = $(".question_item").eq( $(".delete_question").index($(this)) ).attr('question_id');
			DeleteQuestion( NewQuestionInfo );  
			$(".question_item").eq($(".delete_question").index($(this))).remove();
		}
	});
	
	function DeleteQuestion(NewQuestionInfo){
		$.ajax({
		  type: "POST",
		  url: "/delete_question",
		  data: NewQuestionInfo,
		  success: function(msg){
			  //alert("question deleted successfully");
			  window.location.reload(true);
		  }// end post success 
		});
	}// end function UpdateQuestion
	
	/// sorting	
	SortByUpvotes = function(){
		var $wrapper = $('.questions_listing');
		$wrapper.find('.question_item').sort(function (a, b) {
			return +b.getAttribute('upvotes') - +a.getAttribute('upvotes');
		})
		.appendTo( $wrapper );
	}
	
	SortByDownvotes = function(){
		var $wrapper = $('.questions_listing');
		$wrapper.find('.question_item').sort(function (a, b) {
			return +b.getAttribute('downvotes') - +a.getAttribute('downvotes');
		})
		.appendTo( $wrapper );
	}

	
	
});//$(document).ready(function()

