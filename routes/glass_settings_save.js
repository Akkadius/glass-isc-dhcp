/**
 * Created by cmiles on 8/9/2017.
 */

var express = require('express');
var router = express.Router();
var authorize = require('../core/authorize.js');

router.post('/', authorize.auth, function(req, res, next) {
	var request = req.body;
	var json_file = require('jsonfile');

	var glass_config = json_file.readFileSync('config/glass_config.json');

	glass_config.admin_user = request.admin_user;
	glass_config.admin_password = request.admin_password;
	glass_config.leases_file = request.leases_file;
	glass_config.log_file = request.log_file;
	glass_config.config_file = request.config_file;

	json_file.writeFile('./config/glass_config.json', glass_config, {spaces: 2}, function(err) {
		console.error(err)
	});

	res.send('<script type="text/javascript">notification(\'Saved Config!\')</script>');
});

module.exports = router;