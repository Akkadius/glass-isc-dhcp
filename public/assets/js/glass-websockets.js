function check_websocket_connection () {
	if(socket.readyState == 3) {
		connect_websocket();
		console.log("[Websocket] Connection lost... reconnecting...");
	}
}

function connect_websocket() {
	killed_connection = 0;

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


        console_data = event.data;

        if(typeof mac_oui_data !== "undefined") {
            if (console_data.split(":").length - 1 >= 8) {
                var line_data = console_data.split(" ");
                for (i = 0; i < line_data.length; i++) {
                    if ((line_data[i].split(":").length - 1) == 5) {
                        var mac_oui = line_data[i].split(":").join("").toUpperCase().slice(0, 6);
                        console_data = console_data.replace(line_data[i], line_data[i] + " (" + mac_oui_data[mac_oui] + ")");
                    }
                }
            }
        }

		/*
			Note: the only thing I stream currently is dhcp log - so later incoming messages will need to be
			keyed by their "type" via json
		 */

		var grep_value = document.getElementById("grep_fitler").value;

		if(grep_value){
			var matcher = new RegExp(grep_value, "i");
			var found = matcher.test(console_data);
			if(!found && !console_data.includes(grep_value)){
				return false;
			}
		}

		var session = editor.session;
		session.insert({
			row: session.getLength(),
			column: 0
		}, "\n" + console_data);

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