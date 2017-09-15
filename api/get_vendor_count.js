var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/', function(req, res, next) {

    var stat_data = {};

    var count = 0;
    for (var key in dhcp_lease_data) {
        if((typeof dhcp_lease_data[key].mac_oui_vendor !== "undefined" ? dhcp_lease_data[key].mac_oui_vendor : 'Misc') == "")
            continue;

        if(typeof stat_data[(typeof dhcp_lease_data[key].mac_oui_vendor !== "undefined" ? dhcp_lease_data[key].mac_oui_vendor : 'Misc')] === "undefined")
            stat_data[(typeof dhcp_lease_data[key].mac_oui_vendor !== "undefined" ? dhcp_lease_data[key].mac_oui_vendor : 'Misc')] = 0;

        stat_data[(typeof dhcp_lease_data[key].mac_oui_vendor !== "undefined" && dhcp_lease_data[key].mac_oui_vendor != "" ? dhcp_lease_data[key].mac_oui_vendor : 'Misc')]++;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(stat_data));
});

module.exports = router;