var express = require('express');
var router  = express.Router();

router.get('/', function (req, res, next) {

	var stat_data = {};

	var count = 0;
	for (var key in dhcp_lease_data) {

		/* Mac OUI Lookup */
		var mac_oui = "";
		if (typeof dhcp_lease_data[key].mac !== "undefined") {
			mac_oui = dhcp_lease_data[key].mac.split(":").join("").toUpperCase().slice(0, 6);
		}

		if (mac_oui === "")
			continue;

		if (typeof stat_data[mac_oui] === "undefined")
			stat_data[mac_oui] = {};

		if (typeof stat_data[mac_oui].count === "undefined")
			stat_data[mac_oui].count = 0;

		stat_data[mac_oui].count++;

		if (stat_data[mac_oui].mac_prefix !== "undefined") {
			stat_data[mac_oui].mac_prefix = mac_oui;
		}

		if (stat_data[mac_oui].vendor !== "undefined") {
			stat_data[mac_oui].vendor = "N/A";
			if (typeof oui_data[mac_oui] !== "undefined") {
				stat_data[mac_oui].vendor = oui_data[mac_oui];
			}
		}
	}

	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(stat_data));
});

module.exports = router;
