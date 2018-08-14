/**
 * Created by cmiles on 9/21/2017.
 */

var express = require('express');
var router  = express.Router();

router.get('/', function (req, res, next) {
	return_data = {
		"cpu_utilization": cpu_utilization,
		"leases_per_second": current_leases_per_second,
		"leases_per_minute": leases_per_minute,
		"host_name": host_name
	};

	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(return_data));
});

module.exports = router;