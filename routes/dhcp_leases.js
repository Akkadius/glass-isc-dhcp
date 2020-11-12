var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../core/render-template.js');
var json_file = require('jsonfile');
var moment = require('moment');
var glass_config = json_file.readFileSync('../config/glass_config.json');

function human_time (time){
    var humantime = moment(time);
    return humantime.format(glass_config.date_format + " " + glass_config.time_format)
}

router.get('/', function(req, res, next) {
	dhcp_leases = template_render.get_template("dhcp_leases");

	res.send(template_render.get_index_template(dhcp_leases, req.url));
});

module.exports = router;