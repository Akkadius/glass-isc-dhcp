function log_action (action) {
    switch (action) {
        case "stop":
            websockets_unsubscribe_event("dhcp_log_subscription");
            break;
        case "start":
            killed_connection = 0;
            console.log('start readystate is ' + socket.readyState);
            websockets_subscribe_event("dhcp_log_subscription");
            break;
        case "clear":
            editor.setValue("");
            break;
        case "download_logs":
            if (editor.getValue() == '') {
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

get_mac_oui_data();

function get_mac_oui_data() {
	if(typeof mac_oui_data === "undefined") {
		mac_oui_data = {};
        $.getJSON("/api/get_mac_oui_list", function (data) {
            mac_oui_data = data;
        });
    }
}

function parse_log_stream (console_data){

    if (!document.getElementById("dhcp_log")) {
        console.log("[Websocket] DHCP Log unsubscribed");
        socket.send(JSON.stringify({"event_unsubscribe": "dhcp_log_subscription"}));
        killed_connection = 1;
        return false;
    }

    if (typeof mac_oui_data !== "undefined") {
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

    if (grep_value) {
        var matcher = new RegExp(grep_value, "i");
        var found = matcher.test(console_data);
        if (!found && !console_data.includes(grep_value)) {
            return false;
        }
    }

    var session = editor.session;
    session.insert({
        row: session.getLength(),
        column: 0
    }, "\n" + console_data);

    if (session.getLength() >= 50000) {
        /* If we get over 500,000 lines lets clear the editor */
        editor.setValue("");
    }

    var row = editor.session.getLength() - 1;
    var column = editor.session.getLine(row).length; // or simply Infinity
    editor.gotoLine(row + 1, column);

}