$(document).ready(function(){
	
	
	$(".send_message_submit").bind('touchstart click', function(){
		SendMessage();
	});
	
	SendMessage = function()
	{
		
		if( $(".new_msg_text").val().length > 0)
		{
			var chatInfo = new Object();
			chatInfo.marco = $(".chat_box").attr('marco');
			chatInfo.marcoName = $(".chat_box").attr('marcoName');
			chatInfo.polo = $(".chat_box").attr('polo');
			chatInfo.messageInfo = $(".new_msg_text").val();
			PostMessage(chatInfo);
			$('.new_msg_text').val('');
			$('.new_msg_text').text('');
		}//if chatbox message not empty
		
	}// end Submit function
	
	
	function PostMessage(chatInfo){
		$.ajax({
		  type: "POST",
		  url: "/post_message",
		  data: chatInfo,
		  success: function(msg){
				//alert( msg );
		  }// end post success
		});
	}// end function LoginUser
	
	
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
	
	
	
	/////populate page h1 on render
	function GetPolosNameH1(arg){
		$.ajax({
		  type: "POST",
		  url: "/request_polos_name",
		  data: { "polo" : arg},
		  success: function(msg){
		  	$(".message_h1").text("Conversation with: " + msg.firstname);
		  }// end post success
		});
	}// end function LoginUser
	GetPolosNameH1($(".chat_box").attr('polo'));
	
	
	
	var index_i;
	var index_my_id;
	var index_arg;
	//on init populate the left inbox and find the open chat
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
			
			//populate the chat 
			//found my id if this his_id == chat polo then this convo is open
			if( his_user_id == $(".chat_box").attr('polo'))
			{
				//GetPolosName($(".chat_box").attr('polo'));
				//store the variables outside so they can be called outside the loop
				index_i = i;
				index_my_id = $(".chat_box").attr('marco');
				index_arg = arg;
				PopulateChat(i);
			}//enf if
			
			
			/// populate the left inbox	on init
			//if msg not open  in chat && unread && i'm not the sender  then flag it as unread
			if( his_user_id != $(".chat_box").attr('polo') && !arg[i].Messages[ arg[i].Messages.length - 1 ].read && arg[i].Messages[ arg[i].Messages.length - 1 ].from != $(".chat_box").attr('marco') )
				var message = '<a href="/messages/' + his_user_id +'" class="message unread_msg" marco="'+ arg[i].marco +'" polo="'+ arg[i].polo +'">';
			else if ( his_user_id == $(".chat_box").attr('polo')) // is message selected
				var message = '<a href="/messages/' + his_user_id +'" class="message selected_msg" marco="'+ arg[i].marco +'" polo="'+ arg[i].polo +'">';
			else
				var message = '<a href="/messages/' + his_user_id +'" class="message" marco="'+ arg[i].marco +'" polo="'+ arg[i].polo +'">';
			
			message += '<div class="polo_title"><span class="conversation_title"></span></div>';
			message += '<textarea class="messages_display emoji_disabled" data-emojiable="true" > ' + arg[i].Messages[ arg[i].Messages.length - 1 ].marcoName + ": " + arg[i].Messages[ arg[i].Messages.length - 1 ].message  + '</textarea>';
			message += '</a>';
			$(".messages_listings").append(message);
			GetPolosName(his_user_id,i);
			SetEmojis();// in the view
		}// end for
	}//PopulateMessages
	
	// on init
	PopulateChat = function(arg){
		//$(".conversation_display").empty();
		//if i open the chat mark all the messages in chat as read 
		var callForRead = false;
		for(var j = 0; j <index_arg[arg].Messages.length;j++ )
		{
			if( index_arg[arg].Messages[j].from == index_my_id)
				var temp_message = '<textarea class="message_line_right emoji_disabled" data-emojiable="true" >You: ' + index_arg[arg].Messages[j].message + '</textarea>' ;
			else
			{
				var temp_message = '<textarea class="message_line_left emoji_disabled" data-emojiable="true" >' + index_arg[arg].Messages[j].marcoName + ": "+ index_arg[arg].Messages[j].message + '</textarea>' ;
				if( !index_arg[arg].Messages[j].read )
					callForRead = true;	
			}
			$(".conversation_display").append(temp_message);
		}//end for
		
		//if undread messages received mark them as read
		var MessageIndentifyer = new Object();
		MessageIndentifyer.marco = index_arg[arg].marco;
		MessageIndentifyer.polo = index_arg[arg].polo;
		if(callForRead)
			MarkMessageRead(MessageIndentifyer);
		
		SetEmojis();// in the view
		$(".conversation_display").animate({ scrollTop: $('.conversation_display')[0].scrollHeight }, 300);	
		
	}//PopulateChat

	var socket = io();
	socket.on('ConversationUpdated', function(arg){
		//alert("custom socket io event");
		//iza menne elo aw menno ele our conversation
		if( (  arg.from == $(".chat_box").attr('marco') || arg.from == $(".chat_box").attr('polo') ) && ( arg.to == $(".chat_box").attr('marco') || arg.to == $(".chat_box").attr('polo') ) )
			AddIoMessage(arg); //update the chat for the concerned parties
		
		//iza ana included update the inbox on the left
		if( arg.to == $(".chat_box").attr('marco') || arg.from == $(".chat_box").attr('marco'))
			UpdateIoInbox(arg);
		
		SetEmojis();// in the view
	});
	
	//update the open chat from IO
	AddIoMessage =  function(arg){
		
		if( arg.from == $(".chat_box").attr('marco'))
			var temp_message = '<textarea class="message_line_right emoji_disabled" data-emojiable="true">You: ' + arg.message + '</textarea>' ;
		else
		{
			var temp_message = '<textarea class="message_line_left emoji_disabled" data-emojiable="true">' + arg.marcoName + ": "+ arg.message + '</textarea>' ;	
			var MessageIndentifyer = new Object();
			MessageIndentifyer.marco = arg.from;
			MessageIndentifyer.polo = arg.to;
			MarkMessageRead(MessageIndentifyer);
		}
		
		$(".conversation_display").append(temp_message);
		$(".conversation_display").animate({ scrollTop: $('.conversation_display')[0].scrollHeight }, 300);
	}//AddIoMessage
	
	//update the left inbox from Io
	UpdateIoInbox =  function(arg){
		
		var check_convo = false;
		$( ".message" ).each(function() {
		  	//if( arg.from == $(this).attr('marco') || arg.from == $(this).attr('polo') || arg.to == $(this).attr('marco') || arg.to == $(this).attr('polo')  )
			if( (  arg.from == $(this).attr('marco') || arg.from == $(this).attr('polo') ) && ( arg.to == $(this).attr('marco') || arg.to == $(this).attr('polo') ) )
			{
				//$(this).find(".messages_display").text(arg.marcoName + ": "+ arg.message);
				var temp_html = $(this).find(".polo_title").html();
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
			else{
				if(arg.to == $(".chat_box").attr('polo'))
					var message = '<a href="/messages/' + arg.from +'" class="message selected_msg" marco="'+ arg.from +'" polo="'+ arg.to +'">';
				else
					var message = '<a href="/messages/' + arg.from +'" class="message" marco="'+ arg.from +'" polo="'+ arg.to +'">';
			}
				
			message += '<div class="polo_title"><span class="conversation_title"></span></div>';
			message += '<textarea class="messages_display emoji_disabled" data-emojiable="true"> ' + arg.marcoName + ": " + arg.message  + '</textarea>';
			message += '</a>';
			$(".messages_listings").append(message);
			if( arg.to == $(".chat_box").attr('marco'))
				GetPolosName(arg.from, $(".messages_listings").children().length - 1);
			else if( arg.from == $(".chat_box").attr('marco'))
				GetPolosName(arg.to, $(".messages_listings").children().length - 1);
		}//if(check_convo)
				
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

