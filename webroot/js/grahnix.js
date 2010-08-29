var user_id = null;
var room_id = null;
var reset_room = true;

Object.prototype.addListener = function(str, callback) { 
	this.addEventListener(str, callback, false)
	return this
}

window.onload = function(){
	restart_processing('codeCanvas', 'codeEditor')
	var canvas = document.getElementById('codeCanvas')
	var run = document.getElementById('run')
	run.addEventListener('click', canvas_blur_handler, false)

	window.location
	var ws_url = new String(window.location)
	ws_url = ws_url.replace(/http:\/\/([^:\/]+).*/g, '$1')
	socket_to_me = new WebSocket("ws://"+ws_url+":8451")
	socket_to_me
		.addListener('open', function() { 
			login = document.getElementById('login')
			login
				.addListener('click', function() { 
					var username = document.getElementById('user_name').value
					send_message({type:"login", username: username})
				})

		})
		.addListener('message', function(message) { 
			var message = JSON.parse(message.data)
			console.log("Got message"+message)
			handle_message(message, socket_to_me);
		})

	// show home
	var home = document.getElementById('home')
	home.style.display='block';
}

$(document).ready(function(){
    $("#chatline").keydown(function(event){
        if (event.keyCode == 13) {
            var text=$("#chatline").val();
            if(text.length > 0){
                send_message({type:"chat_message",message:text});
            }
            $("#chatline").val("");
        }
    });
});

function update_chats(chats){
    for(var i=0;i<chats.length;i++){
        $("#chatter").append(chats[i].user+": "+chats[i].text+"<br/>");
    }
    $("#chatter").attr({ scrollTop: $("#chatter").attr("scrollHeight") });
}

function send_message(msg){
	console.log ("Sending ")
	console.log (msg)
    socket_to_me.send(JSON.stringify(msg))
}


function create_new_room(e) { 
	send_message({type:'create_room', user_id:user_id})
}

function join_room(e) { 
	if (room_id != null) { 
		send_message({type:'leave_room', user_id:user_id, room_id:room_id.toString()})
	}
	send_message({type:'join_room', user_id:user_id, room_id:this.rel.toString()})	
	room_id = this.rel.toString();
	reset_room = true;
}

function refresh_lobby(rooms) { 
	$('#lobby').css('display', 'none');
	$('#rooms').empty()
	for (var i = 0; i < rooms.length; i++) { 
		var room_link = document.createElement('a');
		$(room_link).attr('href', '#')
		$(room_link).attr('rel', rooms[i].id)
		$(room_link).attr('class', 'room')
		$(room_link).append("Room #"+rooms[i].id)
		$('#rooms').append(room_link);
		room_link.addListener('click', join_room)
	}
	var add_room = document.createElement('a');
	$(add_room).append("Create Room")
	$(add_room).attr('href', '#')
	add_room.addListener('click', create_new_room)
	$('#rooms').append(add_room)
	$('#lobby').css('display', 'block');
}

function create_new_chat(e) { 
	var line_number = $('#linenumber').val()
	send_message({type:'create_chat', room_id:room_id.toString(), user_id:user_id.toString(), line_number:line_number.toString() })
}

function get_chat_messages(chat) { 
	messages = document.createElement('div')
	$(messages).attr('class',"messages")
	for (var i = 0; i < chat.messages.length; i++) {
		message = chat.messages[i]
		$(messages).append('<span class="user">'+message.user.name+':</span>')
		$(messages).append('<span class="message">'+message.text+'</span>')
	}
	return messages;

}

function get_chat_display(chat) { 
	var panel = document.createElement('div')
	var elm = document.createElement('input')
	var send_button = document.createElement('input')
	send_button.type='button';
	send_button.value='Send';
	elm.addListener('keydown', function(e) { 
		if (e.keyCode == 13) { 
			send_message({type:'message', room_id:room_id.toString(), chat_id:chat.id.toString(), user_id:user_id.toString(), text:$(elm).val()})
			$(elm).val('')
		}
	});
	send_button.addListener('click', function() { 
		send_message({type:'message', room_id:room_id.toString(), chat_id:chat.id.toString(), user_id:user_id.toString(), text:$(elm).val()})
		$(elm).val('')
	});
	elm.size=20
	elm.type='text'
	$(panel).attr('class', 'chat_window')
	$(panel).attr('id', 'chat_id_'+chat.id)
	$(panel).append("<h3>Chatting about line "+chat.line+"</h3>")
	var messages = get_chat_messages(chat)
	$(panel).append(messages)
	$(panel).append(elm)
	$(panel).append(send_button)
	return panel;
}

function refresh_chats(chats) { 
	if (reset_room) { 
		$('#discussions').empty()
		reset_room = false;
	}
	console.log(chats)	
	for (var i = 0; i < chats.length; i++) { 
		console.log('chat_id_'+chats[i].id)
		var pane = document.getElementById('chat_id_'+chats[i].id);
		console.log(pane)
		if (pane) { 
			$(get_chat_messages(chats[i])).replaceAll('#chat_id_'+chats[i].id+' div.messages')
		}
		else { 
			$('#discussions').append(get_chat_display(chats[i]))
		}
	}
	var ln = document.getElementById('linenumber');
	if (!ln) {
		var add_container = document.createElement('div')
		var add_chat = document.createElement('a')
		var line_number = document.createElement('input')
		$(line_number).attr('id', 'linenumber');
		$(line_number).attr('type', 'text')
		$(line_number).attr('size', '3')
		$(add_chat).append("Add Discussion")
		$(add_chat).attr('href', '#')
		add_chat.addListener('click', create_new_chat)
		$(add_container).append(add_chat)
		$(add_container).append(line_number)
		$('#discussions').append(add_container)
		$('#chat').css('display','block');
	}
}

function refresh_users(users) { 
   $('#users').css('display', 'none')
   $('#user_list').empty()
   for (var i = 0; i < users.length; i++) { 
	   $('#user_list').append('<span class="user">'+users[i].name+'</span>')
   }
   $('#users').css('display', 'block')
}

function refresh_code(code) { 
	$('#code').css('display', 'none')
	$('#codeEditor').val(code)
 	restart_processing('codeCanvas', 'codeEditor')
	$('#code').css('display', 'block')
}

function handle_message(msg) { 
	console.log(msg)
	if (msg.user_id) { 
		console.log("updating user id")
		user_id = msg.user_id
	}
	if (msg.rooms) { 
		refresh_lobby(msg.rooms)
	}
	if (msg.chats) { 
		refresh_chats(msg.chats)
	}
	if (msg.code != undefined) {
		refresh_code(msg.code)
	}
	if (msg.users) { 
		refresh_users(msg.users)
	}
}

function canvas_blur_handler(e) { 
	send_message({type:'code_update', code:$('#codeEditor').val(), user_id:user_id, room_id:room_id})
}

function restart_processing(canvas_id, code_source) { 
	var canvas = document.getElementById(canvas_id)
	var code = document.getElementById(code_source).value
	try { 
		Processing(canvas, code)
	} catch (e) { 
		alert(e);
	}
}
