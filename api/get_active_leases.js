/**
 * Created by cmiles on 8/9/2017.
 */

var express = require('express');
var router  = express.Router();

router.get('/', function (req, res, next) {
	var lease_parser = require('../core/lease-parser.js');
	lease_parser.clean();

	var dhcp_lease_data_return_buffer = {};

	var search_string = req.query.search;
	if (typeof search_string !== "undefined") {

		for (var key in dhcp_lease_data) {

			var matcher = new RegExp(search_string, "i");

			if (
				!matcher.test(dhcp_lease_data[key].mac_oui_vendor)
				&& !matcher.test(dhcp_lease_data[key].host)
				&& !matcher.test(key)
				&& !matcher.test(dhcp_lease_data[key].mac)
			)
				continue;


			if (typeof dhcp_lease_data_return_buffer[key] !== "undefined")
				dhcp_lease_data_return_buffer[key] = {};

			dhcp_lease_data_return_buffer[key] = dhcp_lease_data[key];

		}

		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(dhcp_lease_data_return_buffer));

		return true;
	}

	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(dhcp_lease_data));
});

module.exports = router;