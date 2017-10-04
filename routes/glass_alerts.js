/**
 * Created by cmiles on 8/9/2017.
 */

var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

router.get('/', authorize.auth, function(req, res, next) {

	glass_settings_template = template_render.get_template("glass_alerts");

	var json_file = require('jsonfile');

	/* Read Config */
	glass_config = json_file.readFileSync('config/glass_config.json');

	/* Shared Network Alert Threshold (Critical) */
	input = template_render.form_input('Shared Network Alert Threshold % (Critical)', '<input type="input" class="form-control" id="shared_network_critical_threshold" placeholder="95%" value="' + glass_config.shared_network_critical_threshold + '">');

	/* Shared Network Alert Threshold (Warning) */
	input = input + template_render.form_input('Shared Network Alert Threshold % (Warning)', '<input type="input" class="form-control" id="shared_network_warning_threshold" placeholder="80" value="' + glass_config.shared_network_warning_threshold + '">');

	/* Leases Per Minute Threshold */
	input = input + template_render.form_input('Alert when Leases Per Minute Reaches Below this Number', '<input type="input" class="form-control" id="leases_per_minute_threshold" placeholder="0" value="' + glass_config.leases_per_minute_threshold + '">');

	// <div id="glass_settings_result"></div>

	form_data = template_render.form_body("glass-alerts-form", input);

	glass_settings_template = template_render.set_template_variable(glass_settings_template, "c_content", form_data);

	/* Slack Webhook URL */
	input = template_render.form_input('Slack Webhook URL <img src="images/slack-icon.png" style="height:25px; width: auto;"> ', '<input type="input" class="form-control" id="slack_webhook_url" placeholder="https://hooks.slack.com/services/xxx/xxx/xxx" value="' + glass_config.slack_webhook_url + '">');

	/* Slack Channel */
	input = input + template_render.form_input('Slack Channel <img src="images/slack-icon.png" style="height:25px; width: auto;"> ', '<input type="input" class="form-control" id="slack_alert_channel" placeholder="#channel" value="' + glass_config.slack_alert_channel + '">');

	/* E-Mail Send To */
    input = input + template_render.form_input(
    	'E-Mail Send To <i class="material-icons" style="font-size: 16px !important;">mail</i>',
		'<input type="input" class="form-control" id="email_alert_to" placeholder="email@example.com, email2@example.com" value="' + glass_config.email_alert_to + '">'
	);

    /* SMS Send To */
    input = input + template_render.form_input(
    	'SMS Gateway E-Mails <i class="material-icons" style="font-size: 16px !important;">perm_phone_msg</i>',
		'<input type="input" class="form-control" id="sms_alert_to" placeholder="smsgatewayemail@example.com, smsgatewayemail@example.com" value="' + glass_config.sms_alert_to + '">'
	);

    // <div id="glass_settings_result"></div>

	form_data = template_render.form_body("glass-notifications-form", input);

	glass_settings_template = template_render.set_template_variable(glass_settings_template, "n_content", form_data);

	glass_settings_template = template_render.set_template_variable(
		glass_settings_template,
		"save_button",
		'<button type="button" class="btn btn-primary waves-effect" onclick="save_alarm_settings()"><i class="material-icons">add_alert</i> <span>Save Alarm Settings</span></button>'
	);

	res.send(template_render.get_index_template(glass_settings_template, req.url));
});

module.exports = router;