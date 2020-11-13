/**
 * Created by cmiles on 8/9/2017.
 */

module.exports = {
	parse: function (input) {
		var lease_data = input.split("lease");
		for (i = 0; i < lease_data.length; i++) {
			ip_address = "";

			lines = lease_data[i].split("\n");
			for (l = 0; l < lines.length; l++) {

				if (typeof lines[5] !== "undefined") {
					if (
						lines[5].trim() === "binding state backup;" ||
						lines[5].trim() === "binding state expired;" ||
						lines[5].trim() === "binding state free;"
					) {
						continue;
					}
				}


				/**
				 * Trim whitespaces at each ends of the line
				 */
				lines[l] = lines[l].trim();

				/**
				 * Break each newline into an array split into spaces
				 * Ex: [ 'starts', '3', '2017/08/09', '04:50:53;' ]
				 *
				 * @type {string[]}
				 */
				line_data_arg = lines[l].split(" ");

				if (/{/i.test(lines[l]) && /\./i.test(lines[l]) && !/uid/i.test(lines[l])) {
					ip_address = line_data_arg[0].trim();
					if (typeof dhcp_lease_data[ip_address] === "undefined") {
						dhcp_lease_data[ip_address] = {};
					}
					option_data = {};
				}
				if (ip_address !== "") {
					if (/start/i.test(lines[l])) {
						/*
						 Make sure we force format as UTC because that is what the leases are formatted in
						 */
						date = (line_data_arg[2] + ' ' + line_data_arg[3]).trim().replace(/\//gi, '-').replace(/;/i, '') + ' UTC';

						start_unix_time                   = (Date.parse(date) / 1000);
						dhcp_lease_data[ip_address].start = start_unix_time;
					}
					if (/ends/i.test(lines[l])) {
						/*
						 Make sure we force format as UTC because that is what the leases are formatted in
						 */
						lease_end = (line_data_arg[2] + ' ' + line_data_arg[3]).trim().replace(/\//gi, '-').replace(/;/i, '') + ' UTC';

						now_unix_time = parseInt((new Date().getTime() / 1000).toFixed(0));
						end_unix_time = parseInt((new Date(lease_end).getTime() / 1000).toFixed(0).toLocaleString());

						/*
						 console.log('now ' + now_unix_time);
						 console.log('end ' + end_unix_time);

						 console.log('now ' + new Date());
						 console.log('end_raw ' + lease_end);
						 console.log('end ' + new Date(lease_end));
						 */

						if (end_unix_time <= now_unix_time) {
							delete dhcp_lease_data[ip_address];
							break;
						}
						dhcp_lease_data[ip_address].end = end_unix_time;
					}
					if (/ethernet/i.test(lines[l])) {
						if (typeof line_data_arg[2] !== "undefined") {
							dhcp_lease_data[ip_address].mac = line_data_arg[2].replace(/;/gi, '').trim();

							if (dhcp_lease_data[ip_address].mac.split(":").join("").trim() === "")
								continue;

							if (dhcp_lease_data[ip_address].mac.split(":").join("").toUpperCase().trim() === "")
								continue;

							/* Mac OUI Lookup */
							var mac_oui = dhcp_lease_data[ip_address].mac.split(":").join("").toUpperCase().slice(0, 6);

							dhcp_lease_data[ip_address].mac_oui_vendor = '';
							if (typeof oui_data[mac_oui] !== "undefined") {
								dhcp_lease_data[ip_address].mac_oui_vendor = oui_data[mac_oui];
							}
						}
					}
					if (/hostname/i.test(lines[l])) {
						if (typeof line_data_arg[1] !== "undefined")
							dhcp_lease_data[ip_address].host = line_data_arg[1].replace(/;/gi, '').replace(/"/gi, '').trim();
					}
					if (/set/i.test(lines[l])) {
						set_data       = lines[l].replace(/;/gi, '').replace(/"/gi, '').replace(/ = /gi, ' ').replace(/set/gi, '').trim();
						set_data_split = set_data.split(" ");

						option_key   = set_data_split[0].trim();
						option_value = set_data.replace(RegExp(option_key, "g"), '').trim();

						option_data[option_key] = option_value;

						if (typeof dhcp_lease_data[ip_address]['options'] === "undefined")
							dhcp_lease_data[ip_address]['options'] = [];
					}
					if (/option/i.test(lines[l])) {
						set_data       = lines[l].replace(/;/gi, '').replace(/"/gi, '').replace(/ = /gi, ' ').replace(/option/gi, '').trim();
						set_data_split = set_data.split(" ");

						option_key   = set_data_split[0].trim();
						option_value = set_data.replace(RegExp(option_key, "g"), '').trim();

						option_data[option_key] = option_value;

						if (typeof dhcp_lease_data[ip_address]['options'] === "undefined")
							dhcp_lease_data[ip_address]['options'] = [];
					}
					if (lines[l].charAt(0) === "}" && typeof dhcp_lease_data[ip_address]['options'] !== "undefined") {
						if (typeof option_data !== 'undefined') {
							dhcp_lease_data[ip_address]['options'] = option_data;
						}

						option_data = [];
					}
					/* End of Lease */
					if (lines[l].charAt(0) === "}") {
						if (debug_watch_lease_parse_stream) {
							console.log("[Glass Server] Lease Parse");
							console.log(JSON.stringify(dhcp_lease_data[ip_address], null, 2));
						}
					}
				}
			}
		}
		return;
	},
	clean: function () {
		for (var key in dhcp_lease_data) {
			now_unix_time = parseInt((new Date().getTime() / 1000).toFixed(0));
			end_unix_time = dhcp_lease_data[key].end;

			if ((now_unix_time >= end_unix_time)) {
				console.log("[DHCP Lease Data] Lease " + key + " has expired - clearing");
				delete dhcp_lease_data[key];
			}
		}
	},
};
