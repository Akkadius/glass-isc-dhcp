var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');

var json_file = require('jsonfile');
glass_config = json_file.readFileSync('config/glass_config.json');

router.get('/', function(req, res, next) {

	/* Display Counters Row */
	counters = template_render.get_template("counters");

	/* Display Shared Networks Row */
	content_shared_networks = template_render.get_template("shared_networks");

	/* Display Subnets Row */
	content_subnets = template_render.get_template("display_subnets");

	res.send(
		counters +
		'<div class="row clearfix">' +
		content_shared_networks + content_subnets +
		'</div>' + '<script type="text/javascript">get_stats();</script>'
	);
});

module.exports = router;

