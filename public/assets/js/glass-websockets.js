function check_websocket_connection () {
	if(socket.readyState == 3) {
		connect_websocket();
		console.log("[Websocket] Connection lost... reconnecting...");
	}
}

function connect_websocket() {
	var killed_connection = 0;

	delete socket;
	socket = new WebSocket("ws://" + window.location.hostname + ":8080");

	socket.onopen = function (event) {
		console.log("[Websocket] socket is opened - readystate is " + socket.readyState);
	};

	socket.onmessage = function (event) {
		if(killed_connection)
			return false;

		if(!document.getElementById("dhcp_log")){
			console.log("[Websocket] DHCP Log unsubscribed");
			socket.send(JSON.stringify({"event_unsubscribe": "dhcp_log_subscription"}));
			killed_connection = 1;
			return false;
		}

		if(document.getElementById("grep_fitler").value){
			var matcher = new RegExp(document.getElementById("grep_fitler").value, "i");
			var found = matcher.test(event.data);
			if(!found){
				return false;
			}
		}

		var session = editor.session;
		session.insert({
			row: session.getLength(),
			column: 0
		}, "\n" + event.data);

		if(session.getLength() >= 50000){
			/* If we get over 500,000 lines lets clear the editor */
			editor.setValue("");
		}

		var row = editor.session.getLength() - 1;
		var column = editor.session.getLine(row).length; // or simply Infinity
		editor.gotoLine(row + 1, column);
	};
}

connect_websocket();

reconnect_timer = setInterval(function(){
	check_websocket_connection ()
}, (1 * 1000));