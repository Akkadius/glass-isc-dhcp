var fs         = require('fs');
const execSync = require('child_process').execSync;

module.exports = {
	startLeasesPerMinuteCalculator: function () {
		return setInterval(function () {
			leases_per_minute_data[leases_per_minute_counter] = current_leases_per_second;
			leases_per_minute_counter++;

			/**
			 * Count how many actual data sets we walked that have values
			 */
			leases_per_minute = 0;
			for (i = 0; i < 59; i++) {
				if (leases_per_minute_data[i] > 0) {
					leases_per_minute += leases_per_minute_data[i];
				}
			}

			if (leases_per_minute_counter === 60)
				leases_per_minute_counter = 0;

			/**
			 * Websockets statistics subscription broadcast
			 */
			if (are_clients_subscribed_to_ws_event('dhcp_statistics')) {
				return_data = {
					"cpu_utilization":   cpu_utilization,
					"leases_per_second": current_leases_per_second,
					"leases_per_minute": leases_per_minute
				};
				wss.broadcast_event(JSON.stringify(return_data), 'dhcp_statistics');
			}

		}, 1000);
	},
	startDashboardTimer: function () {
		return setInterval(function () {
			unix_time = Math.floor(new Date() / 1000);
			if ((unix_time - 5) > leases_last_update_time) {
				current_leases_per_second = 0;
			}

		}, 5000);
	},
	pollCpuUtilizationTimer: function () {
		return setInterval(function () {
			cpu_utilization = parseFloat(execSync("top -bn 1 | awk 'NR>7{s+=$9} END {print s/4}'").toString())
		}, (15 * 1000));
	},
	clearStaleWebsocketConnectionsTimer: function () {
		return setInterval(function () {
			stale_connections_audit();
		}, 30000);
	},
	purgeRequestDataTimer: function () {
		return setInterval(function () {
			for (var key in dhcp_requests) {
				if (dhcp_requests[key].request_count <= 10)
					delete dhcp_requests[key];
			}
		}, 600 * 1000);
	},
	purgeRequestDataCompleteTimer: function () {
		return setInterval(function () {
			dhcp_requests = {};
		}, 3600 * 1000)
	}
};