function log_action (action){
	switch(action) {
		case "stop":
			socket.send(JSON.stringify({"event_unsubscribe": "dhcp_log_subscription"}));
			break;
		case "start":
			socket.send(JSON.stringify({"event_subscription": "dhcp_log_subscription"}));
			break;
		case "clear":
			editor.setValue("");
			break;
		case "download_logs":
			if(editor.getValue() == ''){
				notification('There is nothing to save!');
				return;
			}

			var d = new Date();
			var am_pm = format_am_pm(d);
			var df = d.getMonth() + '-' + d.getDate() + '-' + d.getFullYear() + '_' + (d.getHours()) + '-' + d.getMinutes() + ' ' + am_pm;
			var filename = "dhcp_logs_" + df;
			var text = editor.getValue();
			var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
			saveAs(blob, filename + ".txt");

			break;
		default:
			break;
	}
}

function format_am_pm(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var am_pm = hours >= 12 ? 'PM' : 'AM';
	return am_pm;
}

var killed_connection = 0;

if(typeof socket === "undefined") {
	var socket = new WebSocket("ws://" + window.location.hostname + ":8080");

	socket.onopen = function (event) {
		console.log("socket is opened");
		console.log("[Subscription] subscribing to dhcp log listen ");
	};

	socket.onmessage = function (event) {
		if(killed_connection)
			return false;

		if(!document.getElementById("dhcp_log")){
			console.log("[WS] DHCP Log unsubscribed");
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

$('#dhcp_log').height($(window).height() * 0.6);

var editor = ace.edit("dhcp_log");
editor.setTheme("ace/theme/terminal");
editor.$blockScrolling = Infinity;