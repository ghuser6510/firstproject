$(document).ready(function(){
	
	
	
	function GetMessages(){
		$.ajax({
		  type: "GET",
		  url: "/request_conversations",
		  success: function(msg){
				PopulateMessages( msg );
		  }// end post success
		});
	}// end function LoginUser
	GetMessages();

	function GetPolosName(arg,index){
		$.ajax({
		  type: "POST",
		  url: "/request_polos_name",
		  data: { "polo" : arg},
		  success: function(msg){
		  	$(".conversation_title").eq(index).text(msg.firstname);
		  }// end post success
		});
	}// end function LoginUser
	
	
	//on init populate the left inbox
	PopulateMessages = function(arg){
		for(var i = 0; i< arg.length;i++)
		{
			
			if( arg[i].marco == $(".chat_box").attr('marco'))
			{
				var my_user_id = arg[i].marco;
				var his_user_id = arg[i].polo;
			}
			else
			{
				var my_user_id = arg[i].polo;
				var his_user_id = arg[i].marco;	
			}
			/// populate the left inbox	on init
			//if msg not open  in chat && unread && i'm not the sender  then flag it as unread
			if( his_user_id != $(".chat_box").attr('polo') && !arg[i].Messages[ arg[i].Messages.length - 1 ].read && arg[i].Messages[ arg[i].Messages.length - 1 ].from != $(".chat_box").attr('marco') )
				var message = '<a href="/messages/' + his_user_id +'" class="message unread_msg" marco="'+ arg[i].marco +'" polo="'+ arg[i].polo +'">';
			else if ( his_user_id == $(".chat_box").attr('polo')) // is message selected
				var message = '<a href="/messages/' + his_user_id +'" class="message selected_msg" marco="'+ arg[i].marco +'" polo="'+ arg[i].polo +'">';
			else
				var message = '<a href="/messages/' + his_user_id +'" class="message" marco="'+ arg[i].marco +'" polo="'+ arg[i].polo +'">';
			
			message += '<div class="polo_title"><span class="conversation_title"></span></div>';
			message += '<textarea class="messages_display emoji_disabled" data-emojiable="true"> ' + arg[i].Messages[ arg[i].Messages.length - 1 ].marcoName + ": " + arg[i].Messages[ arg[i].Messages.length - 1 ].message  + '</textarea>';
			message += '</a>';
			$(".messages_listings").append(message);
			GetPolosName(his_user_id,i);
		}
		SetEmojis();// in the view body

	}//PopulateMessages
	

	var socket = io();
	socket.on('ConversationUpdated', function(arg){
		
		//iza ana included update the inbox on the left
		if( arg.to == $(".chat_box").attr('marco') || arg.from == $(".chat_box").attr('marco'))
			UpdateIoInbox(arg);
	});
	
	//update the left inbox from Io
	UpdateIoInbox =  function(arg){
		
		var check_convo = false;
		$( ".message" ).each(function() {
		  	//if( arg.from == $(this).attr('marco') || arg.from == $(this).attr('polo') || arg.to == $(this).attr('marco') || arg.to == $(this).attr('polo')  )
			if( (  arg.from == $(this).attr('marco') || arg.from == $(this).attr('polo') ) && ( arg.to == $(this).attr('marco') || arg.to == $(this).attr('polo') ) )
			{
				var temp_html = $(this).find(".polo_title").html();
				//$(this).find(".messages_display").text(arg.marcoName + ": "+ arg.message);
				$(this).empty();
				$(this).append('<div class="polo_title">' + temp_html  + '</div>');
				$(this).append('<textarea class="messages_display emoji_disabled" data-emojiable="true"> ' + arg.marcoName + ": " + arg.message  + '</textarea>');
				

				check_convo = true;
				
				///if incoming msg not in open chat must add unread
				if( arg.from == $(".chat_box").attr('polo') && arg.to == $(".chat_box").attr('marco') )
				{
					// this is open chat	
				}
				else
				{
					// io about this msg but not open so unread and i'm not the sender
					if( arg.from != $(".chat_box").attr('marco') )
						$(this).addClass('unread_msg');
				}
				
			}// if this io concern these msgs
		});//each
		
		// if existing convo not found must add a new convo to the left inbox
		if(!check_convo)
		{
			if( arg.from != $(".chat_box").attr('marco') )
				var message = '<a href="/messages/' + arg.from +'" class="message unread_msg" marco="'+ arg.from +'" polo="'+ arg.to +'">';
			else
				var message = '<a href="/messages/' + arg.from +'" class="message" marco="'+ arg.from +'" polo="'+ arg.to +'">';
			message += '<div class="polo_title"><span class="conversation_title"></span></div>';
			message += '<textarea class="messages_display emoji_disabled" data-emojiable="true"> ' + arg.marcoName + ": " + arg.message  + '</textarea>';
			message += '</a>';
			$(".messages_listings").append(message);
			
			if( arg.to == $(".chat_box").attr('marco'))
				GetPolosName(arg.from, $(".messages_listings").children().length - 1);
			else if( arg.from == $(".chat_box").attr('marco'))
				GetPolosName(arg.to, $(".messages_listings").children().length - 1);
		}//if(check_convo)
		
		SetEmojis();// in the view body
		
	}//UpdateIoInbox
	
	
	function MarkMessageRead(MessageIndentifyer){
		$.ajax({
		  type: "POST",
		  url: "/mark_message_read",
		  data: MessageIndentifyer,
		  success: function(msg){
				//alert( msg );
		  }// end post success
		});
	}// end function LoginUser
	
	
});//$(document).ready(function()

