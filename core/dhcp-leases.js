var lease_parser = require('./lease-parser.js');
var fs           = require('fs');
var tail         = require('always-tail2');

module.exports = {
	parseLeasesFileOnce: function (glass_config) {
		fs.readFile(glass_config.leases_file, 'utf8', function (err, data) {
			if (err) {
				return console.log(err);
			}
			else {
				lease_parser.parse(data);
				console.log("[Glass Server] Leases file loaded");
			}
		});
	},
	startLeaseListener:  function (glass_config) {
		var lease_read_buffer = "";
		var options           = {};
		options.interval      = 1000;

		let file_tail = new tail(
			glass_config.leases_file,
			"\n",
			options
		);

		console.log("[Glass Server] Watching leases file '" + glass_config.leases_file + "'");

		file_tail.on("line", function (data) {
			unix_time = Math.floor(new Date() / 1000);

			/**
			 * Buffering lines until we get full lease data
			 */
			lease_read_buffer = lease_read_buffer + data + "\n";

			/**
			 * End of lease - cut off and parse the buffer
			 */
			if (/}/i.test(data)) {
				lease_parser.parse(lease_read_buffer);
				lease_read_buffer = "";
			}

			/**
			 * Count leases per second
			 */
			if (/lease/.test(data)) {
				leases_per_second++;
			}
			if (current_time !== unix_time) {
				current_time              = unix_time;
				current_leases_per_second = leases_per_second;
				leases_last_update_time   = unix_time;
				leases_per_second         = 0;
			}
		});
	},
	setLeasesCleanTimer: function () {
		return setInterval(function () {
			lease_parser.clean();
		}, (60 * 1000));
	}
};