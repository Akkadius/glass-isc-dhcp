/**
 * Created by cmiles on 8/9/2017.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');

router.get('/', function(req, res, next) {

	api_examples = template_render.get_template("api_examples");
	api_examples = template_render.set_template_variable(api_examples, "title", "Get Active Leases");

	example_body = 'URL: <code>/api/get_active_leases</code><br><br>';
	example_body = example_body + '<button type="button" onclick="api_example(\'get_active_leases\')" class="btn btn-default waves-effect">Try It!</button><br><br>';
	example_body = example_body + '<div id="get-active-leases"></div>';

	api_examples = template_render.set_template_variable(api_examples, "example_body", example_body);

	res.send (
		template_render.get_index_template(
			api_examples,
			req.url
		)
	);

});

module.exports = router;