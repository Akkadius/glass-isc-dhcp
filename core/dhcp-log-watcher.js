var tail = require('always-tail2');

module.exports = {
	init: function (glass_config) {
		console.log("[Glass Server] DHCP log watcher initialized");

		var options       = {};
		options.interval  = 300;
		var tail_dhcp_log = new tail(
			glass_config.log_file,
			"\n",
			options
		);

		tail_dhcp_log.on("line", function (data) {

			/**
			 * Broadcast log data
			 */
			if (listening_to_log_file) {
				wss.broadcast_event(data, 'dhcp_log_subscription');
			}

			/**
			 * Collect Excessive DHCP Request Data
			 */
			if (/DHCPREQUEST/i.test(data)) {

				var request_from = "";
				var request_for  = "";
				var request_via  = "";

				var request_data = data.split(" ");
				var length       = request_data.length;
				for (var i = 0; i < length; i++) {
					if (request_data[i] === "from") {
						request_from = request_data[i + 1];
					}
					if (request_data[i] === "for") {
						request_for = request_data[i + 1];
					}
					if (request_data[i] === "via") {
						request_via = request_data[i + 1];
					}
				}

				if (typeof dhcp_requests[request_from] === "undefined")
					dhcp_requests[request_from] = {};

				if (typeof dhcp_requests[request_from].request_for === "undefined")
					dhcp_requests[request_from].request_for = request_for;

				if (typeof dhcp_requests[request_from].request_via === "undefined")
					dhcp_requests[request_from].request_via = request_via;

				if (typeof dhcp_requests[request_from].request_count === "undefined")
					dhcp_requests[request_from].request_count = 0;

				if (typeof request_from !== "undefined") {
					if (request_from.length === 17 && /:/.test(request_from)) {
						var mac_oui = request_from.split(":").join("").toUpperCase().slice(0, 6);

						if (typeof dhcp_requests[request_from].request_vendor === "undefined")
							dhcp_requests[request_from].request_vendor = oui_data[mac_oui];
					}
				}

				dhcp_requests[request_from].request_count++;
			}
		});

	},
};