var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../core/render-template.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.url);

	counters = template_render.get_template("counters");

	/* Display Shared Networks Row */
	content_shared_networks = template_render.get_template("shared_networks");

	/* Display Subnets Row */
	content_subnets = template_render.get_template("display_subnets");

	res.send(
		template_render.get_index_template(
		    counters +
			'<div class="row clearfix">' +
			content_shared_networks + content_subnets +
			'</div>',
            req.url
        ) + '<script type="text/javascript">get_stats(); </script>'

	);

});

module.exports = router;