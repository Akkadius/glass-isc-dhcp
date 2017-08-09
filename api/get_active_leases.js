/**
 * Created by cmiles on 8/9/2017.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	var lease_parser = require('../lib/lease_parser.js');
	lease_parser.clean();

	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(dhcp_lease_data));
});

module.exports = router;