/**
 * Created by cmiles on 8/9/2017.
 */

var express = require('express');
var router = express.Router();
var authorize = require('../lib/authorize.js');

router.post('/', authorize.auth, function(req, res, next) {
	var request = req.body;
	var json_file = require('jsonfile');
	var glass_config = json_file.readFileSync('config/glass_config.json');

	glass_config.shared_network_critical_threshold = request.shared_network_critical_threshold;
	glass_config.shared_network_warning_threshold = request.shared_network_warning_threshold;
	glass_config.leases_per_minute_threshold = request.leases_per_minute_threshold;
	glass_config.slack_webhook_url = request.slack_webhook_url;
	glass_config.slack_alert_channel = request.slack_alert_channel;
    glass_config.email_alert_to = request.email_alert_to;
    glass_config.sms_alert_to = request.sms_alert_to;

	json_file.writeFile('./config/glass_config.json', glass_config, {spaces: 2}, function(err) {
		console.error(err);
	});

	res.send('<script type="text/javascript">notification(\'Saved Alert Settings!\')</script>');
});

module.exports = router;