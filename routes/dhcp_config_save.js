/**
 * Created by cmiles on 8/9/2017.
 */

var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	var request = req.body;


	fs.writeFileSync("./syntax_verify_config", request.dhcp_config_data, 'utf8');

	var exec = require('child_process').exec;

	exec('dhcpd -t -cf ./syntax_verify_config > verify_output 2> verify_output', function(err, stdout, stderr)
	{
		var output = fs.readFileSync('./verify_output', "utf8");

		if (err) {
			output = output.replace("\n", "<br>");
			res.send('<script type="text/javascript">notification(\'There are errors!<br>See below for details...\');</script><br></b><b style="color:red">' + output + '</b>');
			return;
		}
		else {

			res.send('<script type="text/javascript">notification(' + JSON.stringify("<b>Syntax OK</b> <br><br>" + output) + ')</script>');

			/* Read Config */
			var json_file = require('jsonfile');
			var glass_config = json_file.readFileSync('config/glass_config.json');

			fs.writeFileSync(glass_config.config_file, request.dhcp_config_data, 'utf8');

			fs.unlinkSync("./verify_output");
			fs.unlinkSync("./syntax_verify_config");
		}
	});
});

module.exports = router;