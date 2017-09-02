/**
 * Created by cmiles on 8/9/2017.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');

router.get('/', function(req, res, next) {

	/* Get Active Leases */
	get_active_leases = template_render.get_template("api_examples");
	get_active_leases = template_render.set_template_variable(get_active_leases, "title", "Get Active Leases");

	example_body = 'URL: <code>/api/get_active_leases</code><br><br>';
	example_body = example_body + '<button type="button" onclick="api_example(\'get_active_leases\')" class="btn btn-default waves-effect">Try It!</button> ';
	example_body = example_body + '<button type="button" onclick="clear_api(\'get_active_leases\')" class="btn btn-default waves-effect">Clear</button><br><br>';
	example_body = example_body + '<div id="get_active_leases"></div>';

	get_active_leases = template_render.set_template_variable(get_active_leases, "example_body", example_body);

	/* Get Subnet Details */
	get_subnet_details = template_render.get_template("api_examples");
	get_subnet_details = template_render.set_template_variable(get_subnet_details, "title", "Get Subnet Details");

	example_body = 'URL: <code>/api/get_subnet_details</code><br><br>';
	example_body = example_body + '<button type="button" onclick="api_example(\'get_subnet_details\')" class="btn btn-default waves-effect">Try It!</button> ';
	example_body = example_body + '<button type="button" onclick="clear_api(\'get_subnet_details\')" class="btn btn-default waves-effect">Clear</button><br><br>';
	example_body = example_body + '<div id="get_subnet_details"></div>';

	get_subnet_details = template_render.set_template_variable(get_subnet_details, "example_body", example_body);

	res.send (
		template_render.get_index_template(
			get_active_leases +
			get_subnet_details
			,
			req.url
		)
	);

});

module.exports = router;