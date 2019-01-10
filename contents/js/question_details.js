$(document).ready(function(){
	
	

	
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
	
	GetPolosName( $(this).find('.owner_id').text(),0); //original owner
	
	GetMyLikes = function(){
		var LikesInfo = new Object();
		LikesInfo.question_id = $(".question_box").attr('question_id');
		//LikesInfo.logged_user = $(".answer_question_text").attr('marco');
		GetLikes(LikesInfo);
	}
	
	GetMyDislikes = function(){
		var DislikesInfo = new Object();
		DislikesInfo.question_id = $(".question_box").attr('question_id');
		//LikesInfo.logged_user = $(".answer_question_text").attr('marco');
		GetDislikes(DislikesInfo);
	}
	
	GetMyUpvote = function(){
		var UpvoteInfo = new Object();
		UpvoteInfo.question_id = $(".question_box").attr('question_id');
		//LikesInfo.logged_user = $(".answer_question_text").attr('marco');
		GetUpvote(UpvoteInfo);
	}	
	
	GetMyDownvote = function(){
		var DownvoteInfo = new Object();
		DownvoteInfo.question_id = $(".question_box").attr('question_id');
		//LikesInfo.logged_user = $(".answer_question_text").attr('marco');
		GetDownvote(DownvoteInfo);
	}
	
	
	//not logged in
	var polo_start_count;
	if( $(".answer_question_text").attr('marco') == "" || $(".answer_question_text").attr('marco') == undefined )
	{
		$(".answer_box").css({"display":"none"});
		$(".like_this").css({"display":"none"});
		$(".dislike_this").css({"display":"none"});
		polo_start_count = 1;
	}
	else{ //if logged in
		$(".answer_box").css({"display":"block"});
		$(".like_this").css({"display":"block"});
		$(".dislike_this").css({"display":"block"});
		GetPolosName( $(".answer_question_text").attr('marco'),1); // my box info
		polo_start_count = 2;
		GetMyLikes();
		GetMyDislikes();
		GetMyUpvote();
		GetMyDownvote();
	}
	
	
	//populate answers owners info
	$( ".answer_item" ).each(function( index ) {
		GetPolosName( $(this).find(".answer_owner_id").text(),(index + polo_start_count));
	});

	
	$(".post_answer").bind('touchstart click', function(){
		AnswerQuestion();
	});
	
	AnswerQuestion = function(){

		if( $(".answer_question_text").val().length != 0)
		{
			var AnswerInfo = new Object();
			AnswerInfo.question_id = $(".question_box").attr('question_id');
			AnswerInfo.answer_owner = $(".answer_question_text").attr('marco');
			AnswerInfo.answer_description = $(".answer_question_text").val();
			AnswerThisQuestion(AnswerInfo);
		}

	}//AnswerQuestion
	
	
	function AnswerThisQuestion(AnswerInfo){
		$.ajax({
		  type: "POST",
		  url: "/answer_question",
		  data: AnswerInfo,
		  success: function(msg){
				//alert( msg );
			  $("body,html").animate({ scrollTop: $("body,html")[0].scrollHeight }, 300);
		  }// end post success
		});
	}// end function PostQuestion	
	
	function GetLikes(LikesInfo){
		$.ajax({
		  type: "POST",
		  url: "/answer_like_check",
		  data: LikesInfo,
		  success: function(msg){
				ShowMyUnlikes(msg);
		  }// end post success
		});
	}// end function GetLikes
	
	function GetDislikes(DislikesInfo){
		$.ajax({
		  type: "POST",
		  url: "/answer_dislike_check",
		  data: DislikesInfo,
		  success: function(msg){
				ShowMyUnDislikes(msg);
		  }// end post success
		});
	}// end function GetLikes
	
	function GetUpvote(UpvoteInfo){
		$.ajax({
		  type: "POST",
		  url: "/question_upvote_check",
		  data: UpvoteInfo,
		  success: function(msg){
				ShowMyUnUpvote(msg);
		  }// end post success
		});
	}// end function GetLikes
	
	function GetDownvote(DownvoteInfo){
		$.ajax({
		  type: "POST",
		  url: "/question_downvote_check",
		  data: DownvoteInfo,
		  success: function(msg){
				ShowMyUnDownvote(msg);
		  }// end post success
		});
	}// end function GetLikes
	
	
	ShowMyUnUpvote = function(arg){
		if(arg)
		{
			$(".upvote_this").css({"display":"none"});
			$(".downvote_this").css({"display":"none"});
			$(".unupvote_this").css({"display":"block"});
		}
	}
	
	ShowMyUnDownvote = function(arg){
		if(arg)
		{
			$(".upvote_this").css({"display":"none"});
			$(".downvote_this").css({"display":"none"});
			$(".undownvote_this").css({"display":"block"});
		}
	}	
	
	
	ShowMyUnlikes = function(arg){
		$(".answer_item").each(function(index) {
			for(var i = 0; i<arg.length;i++)
			{
				if(index == arg[i])//if i like this answer
				{
					$(this).find(".like_this").css({"display":"none"});
					$(this).find(".dislike_this").css({"display":"none"});
					$(this).find(".unlike").css({"display":"block"});
				}
			}
		});
	}//ShowMyUnlikes
	
	ShowMyUnDislikes = function(arg){
		$(".answer_item").each(function(index) {
			for(var i = 0; i<arg.length;i++)
			{
				if(index == arg[i])//if i like this answer
				{
					$(this).find(".like_this").css({"display":"none"});
					$(this).find(".dislike_this").css({"display":"none"});
					$(this).find(".undislike").css({"display":"block"});
				}
			}
		});
	}//ShowMyUnlikes	
	
	$(".like_this").bind('touchstart click', function(){
		var LikeAnswerInfo = new Object();
		LikeAnswerInfo.question_id = $(".question_box").attr('question_id');
		//LikeAnswerInfo.likers_id = $(".answer_question_text").attr('marco');
		LikeAnswerInfo.answer_index = $(".like_this").index($(this));
		LikeAnswer(LikeAnswerInfo);
		$(this).css({"display":"none"});
	});
	
	$(".unlike").bind('touchstart click', function(){
		var UnLikeAnswerInfo = new Object();
		UnLikeAnswerInfo.question_id = $(".question_box").attr('question_id');
		//UnLikeAnswerInfo.likers_id = $(".answer_question_text").attr('marco');
		UnLikeAnswerInfo.answer_index = $(".unlike").index($(this));
		UnLikeAnswer(UnLikeAnswerInfo);
		$(this).css({"display":"none"});
	});	
	
	
	$(".dislike_this").bind('touchstart click', function(){
		var DislikeAnswerInfo = new Object();
		DislikeAnswerInfo.question_id = $(".question_box").attr('question_id');
		//LikeAnswerInfo.likers_id = $(".answer_question_text").attr('marco');
		DislikeAnswerInfo.answer_index = $(".dislike_this").index($(this));
		DislikeAnswer(DislikeAnswerInfo);
		$(this).css({"display":"none"});
	});
	
	$(".undislike").bind('touchstart click', function(){
		var UnDislikeAnswerInfo = new Object();
		UnDislikeAnswerInfo.question_id = $(".question_box").attr('question_id');
		//UnLikeAnswerInfo.likers_id = $(".answer_question_text").attr('marco');
		UnDislikeAnswerInfo.answer_index = $(".undislike").index($(this));
		UnDislikeAnswer(UnDislikeAnswerInfo);
		$(this).css({"display":"none"});
	});
	
	
	////upvoting
	
	$(".upvote_this").bind('touchstart click', function(){
		var UpvoteInfo = new Object();
		UpvoteInfo.question_id = $(".question_box").attr('question_id');
		UpvoteQuestion(UpvoteInfo);
		$(this).css({"display":"none"});
	});
	
	$(".unupvote_this").bind('touchstart click', function(){
		var UnUpvoteInfo = new Object();
		UnUpvoteInfo.question_id = $(".question_box").attr('question_id');
		UnUpvoteQuestion(UnUpvoteInfo);
		$(this).css({"display":"none"});
	});	
	
	
	$(".downvote_this").bind('touchstart click', function(){
		var DownvoteInfo = new Object();
		DownvoteInfo.question_id = $(".question_box").attr('question_id');
		DownvoteQuestion(DownvoteInfo);
		$(this).css({"display":"none"});
	});
	
	$(".undownvote_this").bind('touchstart click', function(){
		var UnDownvoteInfo = new Object();
		UnDownvoteInfo.question_id = $(".question_box").attr('question_id');
		UnDownvoteQuestion(UnDownvoteInfo);
		$(this).css({"display":"none"});
	});	

	
	
	
	
	
	function LikeAnswer(LikeAnswerInfo){
		$.ajax({
		  type: "POST",
		  url: "/like_answer",
		  data: LikeAnswerInfo,
		  success: function(msg){
				//alert( msg );
			  	GetMyLikes();
		  }// end post success
		});
	}// end function LikeAnswer	
	
	function UnLikeAnswer(UnLikeAnswerInfo){
		$.ajax({
		  type: "POST",
		  url: "/unlike_answer",
		  data: UnLikeAnswerInfo,
		  success: function(msg){
				//alert( msg );
				$(".like_this").eq(UnLikeAnswerInfo.answer_index).css({"display":"block"});
				$(".dislike_this").eq(UnLikeAnswerInfo.answer_index).css({"display":"block"});
			    $(".unlike").eq(UnLikeAnswerInfo.answer_index).css({"display":"none"});
		  }// end post success
		});
	}// end function LikeAnswer		
	
	
	function DislikeAnswer(DislikeAnswerInfo){
		$.ajax({
		  type: "POST",
		  url: "/dislike_answer",
		  data: DislikeAnswerInfo,
		  success: function(msg){
				//alert( msg );
			  	GetMyDislikes();
		  }// end post success
		});
	}// end function DislikeAnswer	
	
	function UnDislikeAnswer(UnDislikeAnswerInfo){
		$.ajax({
		  type: "POST",
		  url: "/undislike_answer",
		  data: UnDislikeAnswerInfo,
		  success: function(msg){
				//alert( msg );
				$(".like_this").eq(UnDislikeAnswerInfo.answer_index).css({"display":"block"});
				$(".dislike_this").eq(UnDislikeAnswerInfo.answer_index).css({"display":"block"});
			    $(".undislike").eq(UnDislikeAnswerInfo.answer_index).css({"display":"none"});
		  }// end post success
		});
	}// end function UnDislikeAnswer		
	
	
	function UpvoteQuestion (UpvoteInfo){
		$.ajax({
		  type: "POST",
		  url: "/upvote_question",
		  data: UpvoteInfo,
		  success: function(msg){
				//alert( msg );
			  	GetMyUpvote();
		  }// end post success
		});
	}// end function UpvoteQuestion	
	
	function UnUpvoteQuestion(UnUpvoteInfo){
		$.ajax({
		  type: "POST",
		  url: "/unupvote_question",
		  data: UnUpvoteInfo,
		  success: function(msg){
				//alert( msg );
				$(".upvote_this").css({"display":"block"});
				$(".downvote_this").css({"display":"block"});
			    $(".unupvote_this").css({"display":"none"});
		  }// end post success
		});
	}// end function UnUpvoteQuestion		
	
	function DownvoteQuestion (DownvoteInfo){
		$.ajax({
		  type: "POST",
		  url: "/downvote_question",
		  data: DownvoteInfo,
		  success: function(msg){
				//alert( msg );
			  	GetMyDownvote();
		  }// end post success
		});
	}// end function DownvoteQuestion	
	
	function UnDownvoteQuestion(UnDownvoteInfo){
		$.ajax({
		  type: "POST",
		  url: "/undownvote_question",
		  data: UnDownvoteInfo,
		  success: function(msg){
				//alert( msg );
				$(".upvote_this").css({"display":"block"});
				$(".downvote_this").css({"display":"block"});
			    $(".undownvote_this").css({"display":"none"});
		  }// end post success
		});
	}// end function UnDownvoteQuestion		
	
	
	var socket = io();
	socket.on('AnswerAdded', function(arg){

		if( arg._id == $(".question_box").attr('question_id') )
		{
			var answer = '<div class="answer_item">';
			answer += '<div class="owner_box">';
			answer += '<div class="answer_owner_id">'+ arg.from +'</div>';
			answer += '<div class="owner_name"></div>';
			answer += '<div class="owner_pic"></div></div>';
			answer += '<textarea class="answer_description emoji_disabled" data-emojiable="true" >'+ arg.answer_description +'</textarea>';
			answer += '<div class="answer_likes">';
			answer += '<div class="like_this">like</div>';
			answer += '<div class="likes_count"><span>0</span> likes</div>';
			answer += '<div class="dislike_this">dislike</div>';
			answer += '<div class="dislikes_count"><span>0</span> dislikes</div>';
			answer += '</div>';
			answer += '<div class="unlike">unlike</div>';
			answer += '<div class="undislike">un-dislike</div>';
			answer += '</div>';
			
			$(".answers_holder").append(answer);
			GetPolosName( arg.from,( $(".answers_holder").children().length + 1));
			
			
			if( $(".answer_question_text").attr('marco') == "" || $(".answer_question_text").attr('marco') == undefined )//not logged in
			{
				$(".like_this").css({"display":"none"});
				$(".dislike_this").css({"display":"none"});
			}
			else{//if logged in
				
				$(".like_this").css({"display":"block"});
				$(".dislike_this").css({"display":"block"});
				GetMyLikes();
				GetMyDislikes();
				
				
				$(".like_this").bind('touchstart click', function(){
					var LikeAnswerInfo = new Object();
					LikeAnswerInfo.question_id = $(".question_box").attr('question_id');
					//LikeAnswerInfo.likers_id = $(".answer_question_text").attr('marco');
					LikeAnswerInfo.answer_index = $(".like_this").index($(this));
					LikeAnswer(LikeAnswerInfo);
					$(this).css({"display":"none"});
				});
				
				$(".unlike").bind('touchstart click', function(){
					var UnLikeAnswerInfo = new Object();
					UnLikeAnswerInfo.question_id = $(".question_box").attr('question_id');
					//UnLikeAnswerInfo.likers_id = $(".answer_question_text").attr('marco');
					UnLikeAnswerInfo.answer_index = $(".unlike").index($(this));
					UnLikeAnswer(UnLikeAnswerInfo);
					$(this).css({"display":"none"});
				});
				
				$(".dislike_this").bind('touchstart click', function(){
					var DislikeAnswerInfo = new Object();
					DislikeAnswerInfo.question_id = $(".question_box").attr('question_id');
					//LikeAnswerInfo.likers_id = $(".answer_question_text").attr('marco');
					DislikeAnswerInfo.answer_index = $(".dislike_this").index($(this));
					DislikeAnswer(DislikeAnswerInfo);
					$(this).css({"display":"none"});
				});

				$(".undislike").bind('touchstart click', function(){
					var UnDislikeAnswerInfo = new Object();
					UnDislikeAnswerInfo.question_id = $(".question_box").attr('question_id');
					//UnLikeAnswerInfo.likers_id = $(".answer_question_text").attr('marco');
					UnDislikeAnswerInfo.answer_index = $(".undislike").index($(this));
					UnDislikeAnswer(UnDislikeAnswerInfo);
					$(this).css({"display":"none"});
				});						
				
			}// else if looged in
			
			window.emojiPicker.discover();
			$(".emoji_disabled").attr('contenteditable', false); 

		}// if this is the question
		
		
	});// socket on AnswerAdded
	
	socket.on('AnswerLiked', function(arg){
		if( arg.question_id == $(".question_box").attr('question_id') )
		{
			var likes_count = Number($(".likes_count").eq(arg.answer_index).find("span").text()) + 1;
			$(".likes_count").eq(arg.answer_index).find("span").text(likes_count);
		}// if this is the question
	});// socket on AnswerLiked
	
	socket.on('AnswerUnLiked', function(arg){
		if( arg.question_id == $(".question_box").attr('question_id') )
		{
			var likes_count = Number($(".likes_count").eq(arg.answer_index).find("span").text()) - 1;
			$(".likes_count").eq(arg.answer_index).find("span").text(likes_count);
		}// if this is the question
	});// socket on AnswerUnLiked
	
	
	socket.on('AnswerDisliked', function(arg){
		if( arg.question_id == $(".question_box").attr('question_id') )
		{
			var dislikes_count = Number($(".dislikes_count").eq(arg.answer_index).find("span").text()) + 1;
			$(".dislikes_count").eq(arg.answer_index).find("span").text(dislikes_count);
		}// if this is the question
	});// socket on AnswerDisliked
	
	socket.on('AnswerUnDisliked', function(arg){
		if( arg.question_id == $(".question_box").attr('question_id') )
		{
			var dislikes_count = Number($(".dislikes_count").eq(arg.answer_index).find("span").text()) - 1;
			$(".dislikes_count").eq(arg.answer_index).find("span").text(dislikes_count);
		}// if this is the question
	});// socket on AnswerUnDisliked
	
	
	/////upvoting question io
	socket.on('QuestionUpvoted', function(arg){
		if( arg.question_id == $(".question_box").attr('question_id') )
		{
			var upvotes_count = Number($(".upvotes").find("span").text()) + 1;
			$(".upvotes").find("span").text(upvotes_count);
		}// if this is the question
	});// socket on QuestionUpvoted
	
	socket.on('QuestionUnUpvoted', function(arg){
		if( arg.question_id == $(".question_box").attr('question_id') )
		{
			var upvotes_count = Number($(".upvotes").find("span").text()) - 1;
			$(".upvotes").find("span").text(upvotes_count);
		}// if this is the question
	});// socket on QuestionUnUpvoted
	
	
	socket.on('QuestionDownvoted', function(arg){
		if( arg.question_id == $(".question_box").attr('question_id') )
		{
			var downvotes_count = Number($(".downvotes").find("span").text()) + 1;
			$(".downvotes").find("span").text(downvotes_count);
		}// if this is the question
	});// socket on QuestionDownvoted
	
	socket.on('QuestionUnDownvoted', function(arg){
		if( arg.question_id == $(".question_box").attr('question_id') )
		{
			var downvotes_count = Number($(".downvotes").find("span").text()) -1;
			$(".downvotes").find("span").text(downvotes_count);
		}// if this is the question
	});// socket on QuestionUnDownvoted
	
	
});//$(document).ready(function()

