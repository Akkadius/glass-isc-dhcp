/**
 * Created by cmiles on 8/9/2017.
 */

var express = require('express');
var router  = express.Router();

router.get('/', function (req, res, next) {

	var json_file = require('jsonfile');
	let glass_config = json_file.readFileSync('config/glass_config.json');

	res.setHeader('Content-Type', 'application/json');

	const execSync = require('child_process').execSync;
	output         = execSync('./bin/dhcpd-pools -c ' + glass_config.config_file + ' -l ' + glass_config.leases_file + ' -f j -A -s e');

	res.send(JSON.stringify(JSON.parse(output)));
});

module.exports = router;