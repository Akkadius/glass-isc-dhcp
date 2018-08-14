var fs         = require('fs');
var json_file  = require('jsonfile');

module.exports = {
	init: function () {
		console.log("[Glass Server] Config watcher initialized");

		fs.watch('config/glass_config.json', function (event, filename) {
			if (filename) {
				fsTimeout = setTimeout(function () {
					glass_config = json_file.readFileSync('config/glass_config.json');
					console.log("[Glass Server] Config Loaded");
				}, 1000);
			}
		});
	},
};