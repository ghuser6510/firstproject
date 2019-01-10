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
	
	$( ".link_item" ).each(function( index ) {
		GetPolosName( $(this).find('.owner_id').text(),index);
	});
	
	
	$(".search_button").bind('touchstart click', function(){
		SearchMylinks();
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
	
	SearchMylinks = function(){
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
			current_location = current_location.substring(0, current_location.indexOf('links/'));
			
			var destination = current_location + "links/0";
			destination += "?language=" + $(".input-language-tags").val() + "&keyword=" + $(".search_input").val();
			window.location.href = destination;
		}
		
		
	}//SearchMylinks

	
	/// sorting	
	SortByUpvotes = function(){
		var $wrapper = $('.links_listing');
		$wrapper.find('.link_item').sort(function (a, b) {
			return +b.getAttribute('upvotes') - +a.getAttribute('upvotes');
		})
		.appendTo( $wrapper );
	}
	
	SortByDownvotes = function(){
		var $wrapper = $('.links_listing');
		$wrapper.find('.link_item').sort(function (a, b) {
			return +b.getAttribute('downvotes') - +a.getAttribute('downvotes');
		})
		.appendTo( $wrapper );
	}
	
	$(".delete_link").bind('touchstart click', function(){
		if(confirm('Are you sure?'))
		{
			var NewlinkInfo = new Object();
			NewlinkInfo.link_id = $(".link_item").eq( $(".delete_link").index($(this)) ).attr('link_id');
			Deletelink( NewlinkInfo );  
			$(".link_item").eq($(".delete_link").index($(this))).remove();
		}
	});
	
	function Deletelink(NewlinkInfo){
		$.ajax({
		  type: "POST",
		  url: "/delete_link",
		  data: NewlinkInfo,
		  success: function(msg){
			  //alert("link deleted successfully");
			  location.reload();
		  }// end post success
		});
	}// end function Updatelink
	
});//$(document).ready(function()

