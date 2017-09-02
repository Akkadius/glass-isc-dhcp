var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');

router.get('/', function(req, res, next) {

	var content = "";

	content = template_render.get_template("dhcp_config_snapshots");

	/* Read Config */
	var json_file = require('jsonfile');
	var glass_config = json_file.readFileSync('config/glass_config.json');

	content = template_render.set_template_variable(content, "title", "DHCP Config Snaphots");

	var backups = '';
	fs.readdirSync("./config_backups").forEach(function(file) {
		backups = backups + "<li><a onclick='view_snapshot(" + JSON.stringify(file) + ")'>" + file + '</a></li>';
	});

	if(backups == ''){
		backups = 'There are no snapshots present at this time...';
	}

	content = template_render.set_template_variable(content, "c_content", backups);

	res.send(template_render.get_index_template(content, req.url));
});

module.exports = router;