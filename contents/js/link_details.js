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
		LikesInfo.link_id = $(".link_box").attr('link_id');
		//LikesInfo.logged_user = $(".comment_link_text").attr('marco');
		GetLikes(LikesInfo);
	}
	
	GetMyDislikes = function(){
		var DislikesInfo = new Object();
		DislikesInfo.link_id = $(".link_box").attr('link_id');
		//LikesInfo.logged_user = $(".comment_link_text").attr('marco');
		GetDislikes(DislikesInfo);
	}
	
	GetMyUpvote = function(){
		var UpvoteInfo = new Object();
		UpvoteInfo.link_id = $(".link_box").attr('link_id');
		//LikesInfo.logged_user = $(".comment_link_text").attr('marco');
		GetUpvote(UpvoteInfo);
	}	
	
	GetMyDownvote = function(){
		var DownvoteInfo = new Object();
		DownvoteInfo.link_id = $(".link_box").attr('link_id');
		//LikesInfo.logged_user = $(".comment_link_text").attr('marco');
		GetDownvote(DownvoteInfo);
	}
	
	
	//not logged in
	var polo_start_count;
	if( $(".comment_link_text").attr('marco') == "" || $(".comment_link_text").attr('marco') == undefined )
	{
		$(".comment_box").css({"display":"none"});
		$(".like_this").css({"display":"none"});
		$(".dislike_this").css({"display":"none"});
		polo_start_count = 1;
	}
	else{ //if logged in
		$(".comment_box").css({"display":"block"});
		$(".like_this").css({"display":"block"});
		$(".dislike_this").css({"display":"block"});
		GetPolosName( $(".comment_link_text").attr('marco'),1); // my box info
		polo_start_count = 2;
		GetMyLikes();
		GetMyDislikes();
		GetMyUpvote();
		GetMyDownvote();
		
		var FavoriteLinkInfo = new Object();
		FavoriteLinkInfo.link_id = $(".link_box").attr('link_id');
		CheckIfFavourited(FavoriteLinkInfo);
	}
	
	
	//populate comments owners info
	$( ".comment_item" ).each(function( index ) {
		GetPolosName( $(this).find(".comment_owner_id").text(),(index + polo_start_count));
	});

	
	$(".post_comment").bind('touchstart click', function(){
		commentlink();
	});
	
	commentlink = function(){

		if( $(".comment_link_text").val().length != 0)
		{
			var commentInfo = new Object();
			commentInfo.link_id = $(".link_box").attr('link_id');
			commentInfo.comment_owner = $(".comment_link_text").attr('marco');
			commentInfo.comment_url_destination = $(".comment_link_text").val();
			commentThislink(commentInfo);
		}

	}//commentlink
	
	
	function commentThislink(commentInfo){
		$.ajax({
		  type: "POST",
		  url: "/comment_link",
		  data: commentInfo,
		  success: function(msg){
				//alert( msg );
			  $("body,html").animate({ scrollTop: $("body,html")[0].scrollHeight }, 300);
		  }// end post success
		});
	}// end function Postlink	
	
	function GetLikes(LikesInfo){
		$.ajax({
		  type: "POST",
		  url: "/comment_like_check",
		  data: LikesInfo,
		  success: function(msg){
				ShowMyUnlikes(msg);
		  }// end post success
		});
	}// end function GetLikes
	
	function GetDislikes(DislikesInfo){
		$.ajax({
		  type: "POST",
		  url: "/comment_dislike_check",
		  data: DislikesInfo,
		  success: function(msg){
				ShowMyUnDislikes(msg);
		  }// end post success
		});
	}// end function GetLikes
	
	function GetUpvote(UpvoteInfo){
		$.ajax({
		  type: "POST",
		  url: "/link_upvote_check",
		  data: UpvoteInfo,
		  success: function(msg){
				ShowMyUnUpvote(msg);
		  }// end post success
		});
	}// end function GetLikes
	
	function GetDownvote(DownvoteInfo){
		$.ajax({
		  type: "POST",
		  url: "/link_downvote_check",
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
		$(".comment_item").each(function(index) {
			for(var i = 0; i<arg.length;i++)
			{
				if(index == arg[i])//if i like this comment
				{
					$(this).find(".like_this").css({"display":"none"});
					$(this).find(".dislike_this").css({"display":"none"});
					$(this).find(".unlike").css({"display":"block"});
				}
			}
		});
	}//ShowMyUnlikes
	
	ShowMyUnDislikes = function(arg){
		$(".comment_item").each(function(index) {
			for(var i = 0; i<arg.length;i++)
			{
				if(index == arg[i])//if i like this comment
				{
					$(this).find(".like_this").css({"display":"none"});
					$(this).find(".dislike_this").css({"display":"none"});
					$(this).find(".undislike").css({"display":"block"});
				}
			}
		});
	}//ShowMyUnlikes	
	
	$(".like_this").bind('touchstart click', function(){
		var LikecommentInfo = new Object();
		LikecommentInfo.link_id = $(".link_box").attr('link_id');
		//LikecommentInfo.likers_id = $(".comment_link_text").attr('marco');
		LikecommentInfo.comment_index = $(".like_this").index($(this));
		Likecomment(LikecommentInfo);
		$(this).css({"display":"none"});
	});
	
	$(".unlike").bind('touchstart click', function(){
		var UnLikecommentInfo = new Object();
		UnLikecommentInfo.link_id = $(".link_box").attr('link_id');
		//UnLikecommentInfo.likers_id = $(".comment_link_text").attr('marco');
		UnLikecommentInfo.comment_index = $(".unlike").index($(this));
		UnLikecomment(UnLikecommentInfo);
		$(this).css({"display":"none"});
	});	
	
	
	$(".dislike_this").bind('touchstart click', function(){
		var DislikecommentInfo = new Object();
		DislikecommentInfo.link_id = $(".link_box").attr('link_id');
		//LikecommentInfo.likers_id = $(".comment_link_text").attr('marco');
		DislikecommentInfo.comment_index = $(".dislike_this").index($(this));
		Dislikecomment(DislikecommentInfo);
		$(this).css({"display":"none"});
	});
	
	$(".undislike").bind('touchstart click', function(){
		var UnDislikecommentInfo = new Object();
		UnDislikecommentInfo.link_id = $(".link_box").attr('link_id');
		//UnLikecommentInfo.likers_id = $(".comment_link_text").attr('marco');
		UnDislikecommentInfo.comment_index = $(".undislike").index($(this));
		UnDislikecomment(UnDislikecommentInfo);
		$(this).css({"display":"none"});
	});
	
	
	////upvoting
	
	$(".upvote_this").bind('touchstart click', function(){
		var UpvoteInfo = new Object();
		UpvoteInfo.link_id = $(".link_box").attr('link_id');
		Upvotelink(UpvoteInfo);
		$(this).css({"display":"none"});
	});
	
	$(".unupvote_this").bind('touchstart click', function(){
		var UnUpvoteInfo = new Object();
		UnUpvoteInfo.link_id = $(".link_box").attr('link_id');
		UnUpvotelink(UnUpvoteInfo);
		$(this).css({"display":"none"});
	});	
	
	
	$(".downvote_this").bind('touchstart click', function(){
		var DownvoteInfo = new Object();
		DownvoteInfo.link_id = $(".link_box").attr('link_id');
		Downvotelink(DownvoteInfo);
		$(this).css({"display":"none"});
	});
	
	$(".undownvote_this").bind('touchstart click', function(){
		var UnDownvoteInfo = new Object();
		UnDownvoteInfo.link_id = $(".link_box").attr('link_id');
		UnDownvotelink(UnDownvoteInfo);
		$(this).css({"display":"none"});
	});	

	
	
	
	
	
	function Likecomment(LikecommentInfo){
		$.ajax({
		  type: "POST",
		  url: "/like_comment",
		  data: LikecommentInfo,
		  success: function(msg){
				//alert( msg );
			  	GetMyLikes();
		  }// end post success
		});
	}// end function Likecomment	
	
	function UnLikecomment(UnLikecommentInfo){
		$.ajax({
		  type: "POST",
		  url: "/unlike_comment",
		  data: UnLikecommentInfo,
		  success: function(msg){
				//alert( msg );
				$(".like_this").eq(UnLikecommentInfo.comment_index).css({"display":"block"});
				$(".dislike_this").eq(UnLikecommentInfo.comment_index).css({"display":"block"});
			    $(".unlike").eq(UnLikecommentInfo.comment_index).css({"display":"none"});
		  }// end post success
		});
	}// end function Likecomment		
	
	
	function Dislikecomment(DislikecommentInfo){
		$.ajax({
		  type: "POST",
		  url: "/dislike_comment",
		  data: DislikecommentInfo,
		  success: function(msg){
				//alert( msg );
			  	GetMyDislikes();
		  }// end post success
		});
	}// end function Dislikecomment	
	
	function UnDislikecomment(UnDislikecommentInfo){
		$.ajax({
		  type: "POST",
		  url: "/undislike_comment",
		  data: UnDislikecommentInfo,
		  success: function(msg){
				//alert( msg );
				$(".like_this").eq(UnDislikecommentInfo.comment_index).css({"display":"block"});
				$(".dislike_this").eq(UnDislikecommentInfo.comment_index).css({"display":"block"});
			    $(".undislike").eq(UnDislikecommentInfo.comment_index).css({"display":"none"});
		  }// end post success
		});
	}// end function UnDislikecomment		
	
	
	function Upvotelink (UpvoteInfo){
		$.ajax({
		  type: "POST",
		  url: "/upvote_link",
		  data: UpvoteInfo,
		  success: function(msg){
				//alert( msg );
			  	GetMyUpvote();
		  }// end post success
		});
	}// end function Upvotelink	
	
	function UnUpvotelink(UnUpvoteInfo){
		$.ajax({
		  type: "POST",
		  url: "/unupvote_link",
		  data: UnUpvoteInfo,
		  success: function(msg){
				//alert( msg );
				$(".upvote_this").css({"display":"block"});
				$(".downvote_this").css({"display":"block"});
			    $(".unupvote_this").css({"display":"none"});
		  }// end post success
		});
	}// end function UnUpvotelink		
	
	function Downvotelink (DownvoteInfo){
		$.ajax({
		  type: "POST",
		  url: "/downvote_link",
		  data: DownvoteInfo,
		  success: function(msg){
				//alert( msg );
			  	GetMyDownvote();
		  }// end post success
		});
	}// end function Downvotelink	
	
	function UnDownvotelink(UnDownvoteInfo){
		$.ajax({
		  type: "POST",
		  url: "/undownvote_link",
		  data: UnDownvoteInfo,
		  success: function(msg){
				//alert( msg );
				$(".upvote_this").css({"display":"block"});
				$(".downvote_this").css({"display":"block"});
			    $(".undownvote_this").css({"display":"none"});
		  }// end post success
		});
	}// end function UnDownvotelink		
	
	
	var socket = io();
	socket.on('commentAdded', function(arg){

		if( arg._id == $(".link_box").attr('link_id') )
		{
			var comment = '<div class="comment_item">';
			comment += '<div class="owner_box">';
			comment += '<div class="comment_owner_id">'+ arg.from +'</div>';
			comment += '<div class="owner_name"></div>';
			comment += '<div class="owner_pic"></div></div>';
			comment += '<textarea class="comment_url_destination emoji_disabled" data-emojiable="true" >'+ arg.comment_url_destination +'</textarea>';
			comment += '<div class="comment_likes">';
			comment += '<div class="like_this">like</div>';
			comment += '<div class="likes_count"><span>0</span> likes</div>';
			comment += '<div class="dislike_this">dislike</div>';
			comment += '<div class="dislikes_count"><span>0</span> dislikes</div>';
			comment += '</div>';
			comment += '<div class="unlike">unlike</div>';
			comment += '<div class="undislike">un-dislike</div>';
			comment += '</div>';
			
			$(".comments_holder").append(comment);
			GetPolosName( arg.from,( $(".comments_holder").children().length + 1));
			
			
			if( $(".comment_link_text").attr('marco') == "" || $(".comment_link_text").attr('marco') == undefined )//not logged in
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
					var LikecommentInfo = new Object();
					LikecommentInfo.link_id = $(".link_box").attr('link_id');
					//LikecommentInfo.likers_id = $(".comment_link_text").attr('marco');
					LikecommentInfo.comment_index = $(".like_this").index($(this));
					Likecomment(LikecommentInfo);
					$(this).css({"display":"none"});
				});
				
				$(".unlike").bind('touchstart click', function(){
					var UnLikecommentInfo = new Object();
					UnLikecommentInfo.link_id = $(".link_box").attr('link_id');
					//UnLikecommentInfo.likers_id = $(".comment_link_text").attr('marco');
					UnLikecommentInfo.comment_index = $(".unlike").index($(this));
					UnLikecomment(UnLikecommentInfo);
					$(this).css({"display":"none"});
				});
				
				$(".dislike_this").bind('touchstart click', function(){
					var DislikecommentInfo = new Object();
					DislikecommentInfo.link_id = $(".link_box").attr('link_id');
					//LikecommentInfo.likers_id = $(".comment_link_text").attr('marco');
					DislikecommentInfo.comment_index = $(".dislike_this").index($(this));
					Dislikecomment(DislikecommentInfo);
					$(this).css({"display":"none"});
				});

				$(".undislike").bind('touchstart click', function(){
					var UnDislikecommentInfo = new Object();
					UnDislikecommentInfo.link_id = $(".link_box").attr('link_id');
					//UnLikecommentInfo.likers_id = $(".comment_link_text").attr('marco');
					UnDislikecommentInfo.comment_index = $(".undislike").index($(this));
					UnDislikecomment(UnDislikecommentInfo);
					$(this).css({"display":"none"});
				});						
				
			}// else if looged in
			
			window.emojiPicker.discover();
			$(".emoji_disabled").attr('contenteditable', false); 

		}// if this is the link
		
		
	});// socket on commentAdded
	
	socket.on('commentLiked', function(arg){
		if( arg.link_id == $(".link_box").attr('link_id') )
		{
			var likes_count = Number($(".likes_count").eq(arg.comment_index).find("span").text()) + 1;
			$(".likes_count").eq(arg.comment_index).find("span").text(likes_count);
		}// if this is the link
	});// socket on commentLiked
	
	socket.on('commentUnLiked', function(arg){
		if( arg.link_id == $(".link_box").attr('link_id') )
		{
			var likes_count = Number($(".likes_count").eq(arg.comment_index).find("span").text()) - 1;
			$(".likes_count").eq(arg.comment_index).find("span").text(likes_count);
		}// if this is the link
	});// socket on commentUnLiked
	
	
	socket.on('commentDisliked', function(arg){
		if( arg.link_id == $(".link_box").attr('link_id') )
		{
			var dislikes_count = Number($(".dislikes_count").eq(arg.comment_index).find("span").text()) + 1;
			$(".dislikes_count").eq(arg.comment_index).find("span").text(dislikes_count);
		}// if this is the link
	});// socket on commentDisliked
	
	socket.on('commentUnDisliked', function(arg){
		if( arg.link_id == $(".link_box").attr('link_id') )
		{
			var dislikes_count = Number($(".dislikes_count").eq(arg.comment_index).find("span").text()) - 1;
			$(".dislikes_count").eq(arg.comment_index).find("span").text(dislikes_count);
		}// if this is the link
	});// socket on commentUnDisliked
	
	
	/////upvoting link io
	socket.on('linkUpvoted', function(arg){
		if( arg.link_id == $(".link_box").attr('link_id') )
		{
			var upvotes_count = Number($(".upvotes").find("span").text()) + 1;
			$(".upvotes").find("span").text(upvotes_count);
		}// if this is the link
	});// socket on linkUpvoted
	
	socket.on('linkUnUpvoted', function(arg){
		if( arg.link_id == $(".link_box").attr('link_id') )
		{
			var upvotes_count = Number($(".upvotes").find("span").text()) - 1;
			$(".upvotes").find("span").text(upvotes_count);
		}// if this is the link
	});// socket on linkUnUpvoted
	
	
	socket.on('linkDownvoted', function(arg){
		if( arg.link_id == $(".link_box").attr('link_id') )
		{
			var downvotes_count = Number($(".downvotes").find("span").text()) + 1;
			$(".downvotes").find("span").text(downvotes_count);
		}// if this is the link
	});// socket on linkDownvoted
	
	socket.on('linkUnDownvoted', function(arg){
		if( arg.link_id == $(".link_box").attr('link_id') )
		{
			var downvotes_count = Number($(".downvotes").find("span").text()) -1;
			$(".downvotes").find("span").text(downvotes_count);
		}// if this is the link
	});// socket on linkUnDownvoted
	
	/////favourites
	$(".add_to_favourites").bind('touchstart click', function(){
		var FavoriteLinkInfo = new Object();
		FavoriteLinkInfo.link_id = $(".link_box").attr('link_id');
		AddtoFavourites(FavoriteLinkInfo);
		$(this).css({"display":"none"});
	});	
	
	function AddtoFavourites (FavoriteLinkInfo){
		$.ajax({
		  type: "POST",
		  url: "/add_new_favouritelink",
		  data: FavoriteLinkInfo,
		  success: function(msg){
				//alert( msg );
			  	$(".remove_from_favourites").css({"display":"block"});
		  }// end post success
		});
	}// end function AddtoFavourites

	
	$(".remove_from_favourites").bind('touchstart click', function(){
		var FavoriteLinkInfo = new Object();
		FavoriteLinkInfo.link_id = $(".link_box").attr('link_id');
		RemovefromFavourites(FavoriteLinkInfo);
		$(this).css({"display":"none"});
	});	
	
	function RemovefromFavourites (FavoriteLinkInfo){
		$.ajax({
		  type: "POST",
		  url: "/remove_from_favouritelink",
		  data: FavoriteLinkInfo,
		  success: function(msg){
				//alert( msg );
			  	$(".add_to_favourites").css({"display":"block"});
		  }// end post success
		});
	}// end function AddtoFavourites
	
	function CheckIfFavourited (FavoriteLinkInfo){
		$.ajax({
		  type: "POST",
		  url: "/check_favourited_link",
		  data: FavoriteLinkInfo,
		  success: function(msg){
				if( msg )
			  		$(".remove_from_favourites").css({"display":"block"});
			 	else	
					$(".add_to_favourites").css({"display":"block"});
		  }// end post success
		});
	}// end function AddtoFavourites
	
});//$(document).ready(function()

