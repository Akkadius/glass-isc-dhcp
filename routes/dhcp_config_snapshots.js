var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../core/render-template.js');
var authorize = require('../core/authorize.js');
var json_file = require('jsonfile');
var moment = require('moment');
var glass_config = json_file.readFileSync('../config/glass_config.json');

function human_time (time){
    var humantime = moment(time);
    return humantime.format(glass_config.date_format + " " + glass_config.time_format)
}

router.get('/', authorize.auth, function(req, res, next) {

	var content = "";

	content = template_render.get_template("dhcp_config_snapshots");

	/* Read Config */
	var json_file = require('jsonfile');
	var glass_config = json_file.readFileSync('config/glass_config.json');

	content = template_render.set_template_variable(content, "title", "DHCP Config Snaphots");

	var backups = '';
	fs.readdirSync("./config_backups").forEach(function(file) {
        var stats = fs.statSync("./config_backups/" + file);
        var mtime = human_time(stats.mtime);

		backups = backups + "<tr><td><a style='cursor:pointer;' onclick='view_snapshot(" + JSON.stringify(file) + ")'>" + file + '</a></td><td>' + mtime + '</td></tr>';
	});

	if(backups == ''){
		backups = 'There are no snapshots present at this time...';
	}

	content = template_render.set_template_variable(content, "c_content", backups);

	res.send(template_render.get_index_template(content, req.url));
});

module.exports = router;