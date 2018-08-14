var express = require('express');
var router  = express.Router();

router.get('/', function (req, res, next) {

	var stat_data = {};

	var count = 0;
	for (var key in dhcp_lease_data) {

		/**
		 * If we don't have a vendor - set as N/A
		 */
		if (dhcp_lease_data[key].mac_oui_vendor === "") {
			dhcp_lease_data[key].mac_oui_vendor = "N/A";
		}

		/**
		 * Init array
		 */
		if (typeof stat_data[(typeof dhcp_lease_data[key].mac_oui_vendor !== "undefined" ? dhcp_lease_data[key].mac_oui_vendor : 'Misc')] === "undefined")
			stat_data[(typeof dhcp_lease_data[key].mac_oui_vendor !== "undefined" ? dhcp_lease_data[key].mac_oui_vendor : 'Misc')] = 0;

		let vendor_string = (typeof dhcp_lease_data[key].mac_oui_vendor !== "undefined" && dhcp_lease_data[key].mac_oui_vendor != "" ? dhcp_lease_data[key].mac_oui_vendor : 'Misc');

		/**
		 * Increment vendor count
		 */
		stat_data[vendor_string]++;
	}


	/**
	 * Return JSON response
	 */
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(stat_data));
});

module.exports = router;