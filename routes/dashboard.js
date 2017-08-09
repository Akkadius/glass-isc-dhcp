var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');

/* GET home page. */
router.get('/', function(req, res, next) {

	const execSync = require('child_process').execSync;
	output = execSync('/home/cmiles/dhcpd-pools -c /home/cmiles/dhcpd.conf -l /home/cmiles/dhcpd.leases -f J -A -s e');
	// output = execSync('/home/cmiles/dhcpd-pools -c /etc/dhcp/dhcpd.conf -l /var/lib/dhcp/dhcpd.leases -f j -A -s e');

	var dhcp_data = JSON.parse(output);

	for ( var i = 0; i < dhcp_data['shared-networks'].length; i++) {
		utilization = round(parseFloat(dhcp_data['shared-networks'][i].used / dhcp_data['shared-networks'][i].defined) * 100, 2);
		if(isNaN(utilization))
			utilization = 0;

		dhcp_data['shared-networks'][i].utilization = utilization;
	}
	dhcp_data['shared-networks'].sort(function(a, b) {
		return parseFloat(b.utilization) - parseFloat(a.utilization);
	});


	shared_networks = '';

	for ( var i = 0; i < dhcp_data['shared-networks'].length; i++) {
		table_row = '';
		table_row = table_row + '<td><b>' + dhcp_data['shared-networks'][i].location + '</b></td>';
		table_row = table_row + '<td>' + dhcp_data['shared-networks'][i].used.toLocaleString('en') + '</td>';
		table_row = table_row + '<td>' + dhcp_data['shared-networks'][i].defined.toLocaleString('en') + '</td>';
		table_row = table_row + '<td>' + dhcp_data['shared-networks'][i].free.toLocaleString('en') + '</td>';
		utilization = dhcp_data['shared-networks'][i].utilization;

		table_row = table_row + '<td>' + utilization + '</td>';

		utilization_color = 'green';

		if(utilization >= 80)
			utilization_color = 'orange';
		if(utilization >= 90)
			utilization_color = 'red';

		table_row = table_row + '<td><div class="progress">' +
			'<div class="progress-bar bg-' + utilization_color + '" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100" style="width: ' + utilization + '%"></div>' +
			'</div></td>';

		shared_networks = shared_networks + '<tr>' + table_row + '</tr>';
	}

	/* Display All Subnets */
	for ( var i = 0; i < dhcp_data.subnets.length; i++) {
		utilization = round(parseFloat(dhcp_data.subnets[i].used / dhcp_data.subnets[i].defined) * 100, 2);
		if(isNaN(utilization))
			utilization = 0;

		dhcp_data.subnets[i].utilization = utilization;
	}

	dhcp_data.subnets.sort(function(a, b) {
		return parseFloat(b.utilization) - parseFloat(a.utilization);
	});

	display_subnets = '';

	for ( var i = 0; i < dhcp_data.subnets.length; i++) {
		table_row = '';
		table_row = table_row + '<td><b>' + dhcp_data.subnets[i].location + '</b></td>';
		table_row = table_row + '<td>' + dhcp_data.subnets[i].range + '</td>';
		table_row = table_row + '<td>' + dhcp_data.subnets[i].used.toLocaleString('en') + '</td>';
		table_row = table_row + '<td>' + dhcp_data.subnets[i].defined.toLocaleString('en') + '</td>';
		table_row = table_row + '<td>' + dhcp_data.subnets[i].free.toLocaleString('en') + '</td>';

		utilization = dhcp_data.subnets[i].utilization;
		table_row = table_row + '<td>' + utilization + '</td>';

		utilization_color = 'green';

		if(utilization >= 80)
			utilization_color = 'orange';
		if(utilization >= 90)
			utilization_color = 'red';

		table_row = table_row + '<td><div class="progress">' +
			'<div class="progress-bar bg-' + utilization_color + '" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100" style="width: ' + utilization + '%"></div>' +
			'</div></td>';

		display_subnets = display_subnets + '<tr>' + table_row + '</tr>';
	}

	/* Display Counters Row */
	counters = template_render.get_template("counters");
	hostname = execSync('hostname').toString().trim();
	counters = template_render.set_template_variable(counters, "hostname", hostname);
	counters = template_render.set_template_variable(counters, "current_leases_per_second", current_leases_per_second);
	counters = template_render.set_template_variable(counters, "total_leases", total_leases);
	counters = template_render.set_template_variable(counters, "cpu_utilization", cpu_utilization);

	/* Display Shared Networks Row */
	content_shared_networks = template_render.get_template("shared_networks");
	content_shared_networks = template_render.set_template_variable(content_shared_networks, "table_data", shared_networks);

	/* Display Subnets Row */
	content_subnets = template_render.get_template("display_subnets");
	content_subnets = template_render.set_template_variable(content_subnets, "table_data", display_subnets);

	res.send(
		counters +
		'<div class="row clearfix">' +
		content_shared_networks + content_subnets +
		'</div>'
	);
});

module.exports = router;

function round(num, places) {
	var multiplier = Math.pow(10, places);
	return Math.round(num * multiplier) / multiplier;
}