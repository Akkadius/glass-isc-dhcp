var subscribed_events = [];

function check_websocket_connection () {
    if (socket.readyState == 3) {
        connect_websocket();
        console.log("[Websocket] Connection lost... reconnecting...");
    }
}

function websockets_subscribe_event(event){
    socket.send(JSON.stringify({"event_subscription": event}));
    subscribed_events[event] = true;
}

function websockets_unsubscribe_event(event){
    socket.send(JSON.stringify({"event_unsubscribe": event}));
    delete subscribed_events[event];
}

function websockets_unsubscribe_all_events(){
    if(typeof subscribed_events !== "undefined") {
        if(subscribed_events.length > 0 ) {
            socket.send(JSON.stringify({"event_unsubscribe": "all_events"}));
            subscribed_events = [];
        }
    }
}

function connect_websocket() {
	$.getJSON("/api/get_websocket_config", function (data) {

		var websocket_port = data.ws_port;

		delete socket;
		socket = new WebSocket("ws://" + window.location.hostname + ":" + websocket_port);

		socket.onopen = function (event) {
			console.log("[Websocket] socket is opened - readystate is " + socket.readyState);
		};

		socket.onmessage = function (data) {

			var event_data = JSON.parse(data.data);

			/*
				{event: "dhcp_log_subscription", data: "Oct  3 16:02:59 DHCP-Server dhcpd[5303]: reuse_l…% threshold, reply with unaltered, existing lease"}
			*/

			if (!subscribed_events[event_data['event']])
				return false;

			/* Event Hooks */
			if (event_data['event'] === 'dhcp_log_subscription')
				parse_log_stream(event_data.data);

			if (event_data['event'] === 'dhcp_statistics')
				parse_statistics_stream(event_data.data);

		};
	});
}

connect_websocket();

reconnect_timer = setInterval(function(){
	check_websocket_connection ()
}, (1 * 1000));