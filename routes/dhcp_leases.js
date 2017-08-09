var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');

function human_time (time){
	var time = new Date(time);
	var year = time.getFullYear();
	var month = time.getMonth()+1;
	var date1 = time.getDate();
	var hour = time.getHours();
	var minutes = time.getMinutes();
	var seconds = time.getSeconds();

	return year + "-" + month+"-"+date1+" "+hour+":"+minutes+":"+seconds;
}

router.get('/', function(req, res, next) {
	dhcp_leases = template_render.get_template("dhcp_leases");

	table_data = '';

	for (var key in dhcp_lease_data) {

		table_row = '';
		table_row = table_row + '<td>' + key + '</td>';
		table_row = table_row + '<td>' + dhcp_lease_data[key].mac + '</td>';
		table_row = table_row + '<td>' + (dhcp_lease_data[key].host ? dhcp_lease_data[key].host : '') + '</td>';
		table_row = table_row + '<td>' + human_time(dhcp_lease_data[key].start * 1000) + '</td>';
		table_row = table_row + '<td>' + human_time(dhcp_lease_data[key].end * 1000) + '</td>';
		table_row = table_row + '<td></td>';

		table_data = table_data + '<tr>' + table_row + '</tr>';
	}

	table_data = template_render.set_template_variable(dhcp_leases, "table_data", table_data);

	res.send(template_render.get_index_template(table_data, req.url));
});

module.exports = router;