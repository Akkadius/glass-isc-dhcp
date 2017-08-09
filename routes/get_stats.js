var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');

/* GET home page. */
router.get('/', function(req, res, next) {

	const execSync = require('child_process').execSync;
	// dhcp_exec = execSync('/home/cmiles/dhcpd-pools -c /home/cmiles/dhcpd.conf -l /home/cmiles/dhcpd.leases -f j -A -s e');
	dhcp_exec = execSync('/home/cmiles/dhcpd-pools -c /etc/dhcp/dhcpd.conf -l /var/lib/dhcp/dhcpd.leases -f j -A -s e');
	cpu_utilization = parseFloat(execSync("top -bn 1 | awk 'NR>7{s+=$9} END {print s/4}'"));


	var dhcp_data = JSON.parse(dhcp_exec);

	total_leases = dhcp_data.summary.used;

	return_data = {
		"cpu_utilization": cpu_utilization,
		"leases_used": total_leases,
		"leases_per_second": current_leases_per_second
	};

	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(return_data));
});

module.exports = router;