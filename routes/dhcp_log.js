var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../core/render-template.js');
var json_file = require('jsonfile');
var moment = require('moment');
var glass_config = json_file.readFileSync('config/glass_config.json');

function human_time (time){
    var humantime = moment(time);
    return humantime.format(glass_config.date_format + " " + glass_config.time_format)
}

router.get('/', function(req, res, next) {

	var content = "";

	content = template_render.get_template("dhcp_log");
	content = template_render.set_template_variable(content, "title", "DHCP Log");
	content = template_render.set_template_variable(content, "log_content", "");

	res.send(template_render.get_index_template(content, req.url));
});

module.exports = router;