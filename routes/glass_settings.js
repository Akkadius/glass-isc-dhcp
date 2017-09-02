/**
 * Created by cmiles on 8/9/2017.
 */

var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');

router.get('/', function(req, res, next) {

	glass_settings_template = template_render.get_template("glass_settings");

	var json_file = require('jsonfile');

	/* Read Config */
	glass_config = json_file.readFileSync('config/glass_config.json');

	/* Leases File */
	input = template_render.form_input('Leases File', '<input type="input" class="form-control" id="leases_file" placeholder="/var/lib/dhcp/dhcpd.leases" value="' + glass_config.leases_file + '">');

	/* Config File */
	input = input + template_render.form_input('Config File', '<input type="input" class="form-control" id="config_file" placeholder="/etc/dhcp/dhcpd.conf" value="' + glass_config.config_file + '">');

	/* Admin User */
	input = input + template_render.form_input('Admin User', '<input type="input" class="form-control" id="admin_user" placeholder="Username" value="' + glass_config.admin_user + '">');
	input = input + template_render.form_input('Admin Password', '<input type="input" class="form-control" id="admin_password" placeholder="Password" value="' + glass_config.admin_password + '">');

	input = input + '<br><button type="button" class="btn btn-info waves-effect" onclick="save_config()"><i class="material-icons">settings</i> <span>Save Config</span></button>';
	input = input + '<br><div id="glass_settings_result"></div>';

	form_data = template_render.form_body("glass-settings-form", input);

	glass_settings_template = template_render.set_template_variable(glass_settings_template, "body_content", form_data);

	res.send(template_render.get_index_template(glass_settings_template, req.url));
});

module.exports = router;