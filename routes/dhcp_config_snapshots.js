var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

function human_time (time){
    var time = new Date(time);
    var year = time.getFullYear();
    var month = time.getMonth()+1;
    var date1 = time.getDate();
    var hour = time.getHours();
    var minutes = time.getMinutes();
    var seconds = time.getSeconds();

    var hour = time.getHours();
    var minute = time.getMinutes();
    var amPM = (hour > 11) ? "PM" : "AM";
    if(hour > 12) {
        hour -= 12;
    } else if(hour == 0) {
        hour = "12";
    }
    if(minute < 10) {
        minute = "0" + minute;
    }

    return year + "-" + month+"-"+date1+" "+hour + ":" + minute + ' ' + amPM;
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