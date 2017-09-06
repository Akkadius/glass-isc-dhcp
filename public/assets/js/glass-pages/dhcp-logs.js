function log_action (action){
	switch(action) {
		case "stop":
			socket.send(JSON.stringify({"event_unsubscribe": "dhcp_log_subscription"}));
			break;
		case "start":
			console.log('start readystate is ' + socket.readyState);
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

$('#dhcp_log').height($(window).height() * 0.6);

var editor = ace.edit("dhcp_log");
editor.setTheme("ace/theme/terminal");
editor.$blockScrolling = Infinity;