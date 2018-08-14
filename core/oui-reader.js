var fs = require('fs');

module.exports = {
	initOuiDatabase: function () {
		var oui_database_file = "bin/oui_table.txt";

		if (fs.existsSync(oui_database_file)) {
			fs.readFile(oui_database_file, 'utf8', function (err, data) {
				if (err) {
					return console.log(err);
				}
				else {
					lines = data.split("\n");
					for (l = 0; l < lines.length; l++) {
						/* Trim whitespaces at each ends of the line */
						lines[l]          = lines[l].trim();
						var oui_line_data = lines[l].split(":::");

						if (typeof oui_line_data[1] !== "undefined")
							oui_data[oui_line_data[0].trim()] = oui_line_data[1].trim();
					}
					console.log("[Glass Server] OUI Database Loaded");
				}
			});
		}
	},
};