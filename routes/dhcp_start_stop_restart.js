var express         = require('express');
var router          = express.Router();
var template_render = require('../lib/render_template.js');
var authorize       = require('../lib/authorize.js');

router.get('/', authorize.auth, function (req, res, next) {

	var content = "";

	content = template_render.get_template("dhcp_start_stop_restart");
	content = template_render.set_template_variable(content, "title", "Start / Stop / Restart");

	var exec = require('child_process').exec;

	exec('ps aux | grep dhcpd | grep -v "grep"', function (err, stdout, stderr) {
		is_running = 0;
		var result = stdout.split("\n");
		for (var i = 0; i < result.length; i++) {
			if (/dhcpd/i.test(result[i])) {
				is_running = 1;
			}
			// console.log('line ' + result[i]);
		}

		var return_content = "";

		if (is_running) {
			return_content = return_content + 'DHCP Server is online!<br><br>';
			return_content = return_content + '<button type="button" onclick="process_action(\'stop\')" class="btn btn-default waves-effect">Stop Server</button> ';
		}
		else {
			return_content = return_content + 'DHCP Server is offline!<br><br>';
			return_content = return_content + '<button type="button" onclick="process_action(\'start\')" class="btn btn-default waves-effect">Start Server</button> ';
		}

		return_content = return_content + '<button type="button" onclick="process_action(\'restart\')" class="btn btn-default waves-effect">Restart Server</button> ';
		content        = template_render.set_template_variable(content, "c_content", return_content);

		res.send(template_render.get_index_template(content, req.url));
	});
});

router.post('/', authorize.auth, function (req, res, next) {
	var request    = req.body;
	const execSync = require('child_process').execSync;

	/**
	 * Get distribution
	 */
	const distro = execSync('cat /etc/issue | head -n 1').toString();

	/**
	 * Base service name - Known to Ubuntu/Debian
	 *
	 * @type {string}
	 */
	let service_name = "isc-dhcp-server";

	/**
	 * Redhat derivatives use a different service name
	 */
	if (/Redhat|CentOS|Fedora/i.test(distro)) {
		service_name = "dhcpd";
	}

	/**
	 * Execute service action and return javascript in request
	 */
	switch (request.action) {
		case "stop":
			dhcp_exec = execSync('/usr/sbin/service ' + service_name + ' stop && /bin/sleep 1');
			res.send("<script type='text/javascript'>notification('DHCP Server Stopped');ignore_cache = 1;do_pjax_request('/dhcp_start_stop_restart');$('#mdModal').modal('hide');</script>");
			break;
		case "start":
			dhcp_exec = execSync('/usr/sbin/service ' + service_name + ' start');
			res.send("<script type='text/javascript'>notification('DHCP Server Started');ignore_cache = 1;do_pjax_request('/dhcp_start_stop_restart');</script>");
			break;
		case "restart":
			dhcp_exec = execSync('/usr/sbin/service ' + service_name + ' restart && /bin/sleep 1');
			res.send("<script type='text/javascript'>notification('DHCP Server Restarted " + dhcp_exec + "');ignore_cache = 1;do_pjax_request('/dhcp_start_stop_restart');$('#mdModal').modal('hide');</script>");
			break;
		default:
			break;
	}
});

module.exports = router;