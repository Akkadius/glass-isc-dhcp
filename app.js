var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const execSync = require('child_process').execSync;

var app = express();

/* Read Config */
var json_file = require('jsonfile');
var glass_config = json_file.readFileSync('config/glass_config.json');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if(glass_config.ip_ranges_to_allow != "") {
	var ip_filter = require('express-ipfilter').IpFilter;
	var ips = glass_config.ip_ranges_to_allow;
	app.use(ip_filter(ips, {mode: 'allow'}));
}

/* Normal Web Routes */
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/get_stats', require('./routes/get_stats'));
app.use('/dhcp_statistics', require('./routes/dhcp_statistics_page'));
app.use('/dhcp_leases', require('./routes/dhcp_leases'));
app.use('/dhcp_log', require('./routes/dhcp_log'));
app.use('/dhcp_config', require('./routes/dhcp_config'));
app.use('/dhcp_config_snapshots', require('./routes/dhcp_config_snapshots'));
app.use('/dhcp_config_snapshot_view', require('./routes/dhcp_config_snapshot_view'));
app.use('/dhcp_config_save', require('./routes/dhcp_config_save'));
app.use('/dhcp_start_stop_restart', require('./routes/dhcp_start_stop_restart'));
app.use('/api_examples', require('./routes/api_examples'));
app.use('/glass_settings', require('./routes/glass_settings'));
app.use('/glass_alerts', require('./routes/glass_alerts'));
app.use('/glass_alert_settings_save', require('./routes/glass_alert_settings_save'));
app.use('/glass_settings_save', require('./routes/glass_settings_save'));

/* API Routes */
app.use('/api/get_active_leases/', require('./api/get_active_leases'));
app.use('/api/get_subnet_details/', require('./api/get_subnet_details'));
app.use('/api/get_vendor_count/', require('./api/get_vendor_count'));

app.set('view engine', 'html');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.send(err.message);
});

module.exports = app;

/**
 * Global Variables
 */
leases_per_minute = 0;
cpu_utilization = 0;
total_leases = 0;

current_time = 0;
leases_per_second = 0;
current_leases_per_second = 0;
leases_last_update_time = 0;

listening_to_log_file = 0;

options = {};
options.interval = 1000;

debug_watch_lease_parse_stream = 0;

host_name = execSync("cat /etc/hostname").toString();

/**
 * Ingest OUI Database
 */
fs = require('fs');
var oui_database_file = "bin/oui_table.txt";
/* Global oui_data bucket */
oui_data = {};
if (fs.existsSync(oui_database_file)) {
    fs.readFile(oui_database_file, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        else {
			/* Iterate through file */
            lines = data.split("\n");
            for (l = 0; l < lines.length; l++) {
				/* Trim whitespaces at each ends of the line */
                lines[l] = lines[l].trim();
                var oui_line_data = lines[l].split(":::");

                if(typeof oui_line_data[1] !== "undefined")
                    oui_data[oui_line_data[0].trim()] = oui_line_data[1].trim();
            }
            console.log("[Glass Server] OUI Database Loaded");
        }
    });
}

/**
 * Ingest Current Lease File
 */
var lease_parser = require('./lib/lease_parser.js');
dhcp_lease_data = {};
lease_read_buffer = "";

fs = require('fs');
fs.readFile(glass_config.leases_file, 'utf8', function (err,data) {
	if (err) {
		return console.log(err);
	}
	else {
		lease_parser.parse(data);
        console.log("[Glass Server] Leases file loaded");
	}
});

/**
 * Leases File Listener
 */
var tail_module = require('always-tail2');
tail = new tail_module(
	glass_config.leases_file,
	"\n",
	options
);

tail.on("line", function(data) {
	unix_time = Math.floor(new Date() / 1000);

	/* Buffering lines until we get full lease data */
	lease_read_buffer = lease_read_buffer + data + "\n";

	/* End of lease - cut off and parse the buffer */
	if (/}/i.test(data)){
		lease_parser.parse(lease_read_buffer);
		lease_read_buffer = "";
	}

	/* Count leases per second */
    if(/lease/.test(data)) {
		leases_per_second++;
	}
	if(current_time != unix_time) {
		current_time = unix_time;
		current_leases_per_second = leases_per_second;
		leases_last_update_time = unix_time;
		leases_per_second = 0;
	}
});

/**
 * Watch DHCP Log File
 */

var json_file = require('jsonfile');
var glass_config = json_file.readFileSync('config/glass_config.json');

var options = {};
options.interval = 1000;

var dashboard_timer = setInterval(function(){
	// console.log("Checking timers...");
	unix_time = Math.floor(new Date() / 1000);
	if((unix_time - 5) > leases_last_update_time){
		current_leases_per_second = 0;
    }

	// console.log(JSON.stringify(dhcp_lease_data, null, 2));

}, 5000);

/**
 * Calculate leases per minute
 */
var leases_per_minute_data = [];
var leases_per_minute_counter = 0;

leases_per_minute_counter_timer = setInterval(function(){
	// console.log("leases per minute counter %i", leases_per_minute_counter);

	leases_per_minute_data[leases_per_minute_counter] = current_leases_per_second;
	leases_per_minute_counter++;

	/* Count how many actual data sets we walked that have values */
	leases_per_minute = 0;
	for (i = 0; i < 59; i++){
		if(leases_per_minute_data[i] > 0) {
			leases_per_minute += leases_per_minute_data[i];
			// console.log("iteration " + i + " val: " + leases_per_minute_data[i] + " lpm: " + leases_per_minute);
		}
		else {
			// console.log("no data " + i);
		}
	}

	if (leases_per_minute_counter == 60)
		leases_per_minute_counter = 0;

}, 1000);

/**
 * Poll: CPU Utilization
 */
cpu_utilization_poll = setInterval(function(){
	cpu_utilization = parseFloat(execSync("top -bn 1 | awk 'NR>7{s+=$9} END {print s/4}'").toString())
}, (15 * 1000));

/**
 * Clean Expired Leases
 */
lease_clean_timer = setInterval(function(){
	lease_parser.clean();
}, (60 * 1000));

function get_socket_clients_connected_count() {
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			socket_clients++;
		}
	});
	return socket_clients;
}

/**
 * Watch config changes so we reload it for core functions...
 */
fs.watch('config/glass_config.json', function (event, filename) {
	if (filename) {
		setTimeout(function(){
			glass_config = json_file.readFileSync('config/glass_config.json');
            console.log("[Glass Server] Config Loaded");
		}, 1000);
	} else {
		console.log('filename not provided');
	}
});

/**
 * Websocket Server
 */

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

options.interval = 300;
var tail_dhcp_log = new tail_module(
	glass_config.log_file,
	"\n",
	options
);

tail_dhcp_log.on("line", function(data) {
	if(listening_to_log_file) {
		wss.broadcast_event(data, 'dhcp_log_subscription');
	}
});

wss.on('connection', function connection(ws) {
	socket_clients++;
	console.log("[WS] CLIENT_CONNECT: Socket clients (" + socket_clients + ")");

	if (!listening_to_log_file) {
		/* Watch log file for new information */
		var tail_module = require('always-tail2');

		listening_to_log_file = 1;
	}

});

wss.on('close', function close() {
	socket_clients--;
	console.log("[WS] CLIENT_DISCONNECT: Socket clients (" + socket_clients + ")");
});

function heartbeat() {
	this.isAlive = true;
}

function isJson(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

wss.on('connection', function connection(ws) {
	ws.isAlive = true;
	ws.on('pong', heartbeat);
	ws.event_subscription = [];

	ws.on('message', function incoming(data) {
		if(data != "" && isJson(data)) {
			var json = JSON.parse(data);
			if(typeof json["event_subscription"] !== "undefined"){
				console.log("[WS] Incoming Subscription '%s'", json['event_subscription']);
				ws.event_subscription[json["event_subscription"]] = 1;
			}
			if(typeof json["event_unsubscribe"] !== "undefined"){
				console.log("[WS] event_unsubscribe '%s'", json['event_unsubscribe']);
				delete ws.event_subscription[json["event_unsubscribe"]];
			}
		}
	});

	stale_connections_audit();
});

wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
};

wss.broadcast_event = function broadcast(data, event) {
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			if(client.event_subscription[event])
				client.send(data);
		}
	});
};

function stale_connections_audit() {
	socket_clients = 0;
	wss.clients.forEach(function each(ws) {
		if (ws.isAlive === false) return ws.terminate();

		ws.isAlive = false;
		ws.ping('', false, true);

		socket_clients++;
	});

	console.log("[WS] STATUS: Socket clients (" + socket_clients + ")");
}

/* Keepalive - kill stale connections (30s poll) */
const interval = setInterval(function ping() {
	stale_connections_audit();
}, 30000);

var socket_clients = 0;


/**
 * Slack Hooks
 */


var Slack = require('slack-node');

webhookUri = glass_config.slack_webhook_url;

slack = new Slack();
slack.setWebhook(webhookUri);

function slack_message(message) {
	console.log("[Slack] %s", message);

	slack.webhook({
		channel: glass_config.slack_alert_channel,
		username: "Glass",
		icon_emoji: "https://imgur.com/wD3CcBi",
		text: message
	}, function (err, response) {
		console.log(response);
	});
}

/**
 * Alert Checks
 */

alert_status = [];
alert_status['leases_per_minute'] = 0;
setTimeout(function(){
    console.log("[Glass Server] Alert loop started");

    alert_check_timer = setInterval(function(){
		console.log("[Timer] Alert Timer check");
		if(glass_config.leases_per_minute_threshold > 0) {
			console.log("[Timer] lpm: %s lpm_th: %s", leases_per_minute, glass_config.leases_per_minute_threshold);
			if (leases_per_minute <= glass_config.leases_per_minute_threshold && alert_status['leases_per_minute'] == 0) {
				alert_status['leases_per_minute'] = 1;
				slack_message(":warning: WARNING: DHCP leases per minute have dropped below threshold (" + parseInt(glass_config.leases_per_minute_threshold).toLocaleString('en') + ") Current (" + parseInt(leases_per_minute).toLocaleString('en') + ")");
			}
			else if (leases_per_minute >= glass_config.leases_per_minute_threshold && alert_status['leases_per_minute'] == 1) {
				alert_status['leases_per_minute'] = 0;
				slack_message(":white_check_mark: CLEAR: DHCP leases per minute have returned to above threshold (" + parseInt(glass_config.leases_per_minute_threshold).toLocaleString('en') + ") Current (" + parseInt(leases_per_minute).toLocaleString('en') + ")");
			}
		}
	}, (60 * 1000));

	alert_status_networks_warning = [];
	alert_status_networks_critical = [];

	alert_subnet_check_timer = setInterval(function(){
		console.log("[Timer] Alert Timer check - subnets");

		if(glass_config.shared_network_warning_threshold > 0 || glass_config.shared_network_critical_threshold > 0) {
			const execSync = require('child_process').execSync;
			output = execSync('./bin/dhcpd-pools -c ' + glass_config.config_file + ' -l ' + glass_config.leases_file + ' -f j -A -s e');
			var dhcp_data = JSON.parse(output);

			/*
			* Iterate through Shared Networks
			 */
			for ( var i = 0; i < dhcp_data['shared-networks'].length; i++) {
				utilization = round(parseFloat(dhcp_data['shared-networks'][i].used / dhcp_data['shared-networks'][i].defined) * 100, 2);

				if(isNaN(utilization))
					utilization = 0;


				/* Initialize these array buckets */
				if(typeof alert_status_networks_warning[dhcp_data['shared-networks'][i].location] === "undefined")
					alert_status_networks_warning[dhcp_data['shared-networks'][i].location] = 0;

				if(typeof alert_status_networks_critical[dhcp_data['shared-networks'][i].location] === "undefined")
					alert_status_networks_critical[dhcp_data['shared-networks'][i].location] = 0;

				/*
				console.log("Location: %s", dhcp_data['shared-networks'][i].location);
				console.log("Used: %s", dhcp_data['shared-networks'][i].used.toLocaleString('en'));
				console.log("Defined: %s", dhcp_data['shared-networks'][i].defined.toLocaleString('en'));
				console.log("Free: %s", dhcp_data['shared-networks'][i].free.toLocaleString('en'));
				console.log("Utilization: %s", utilization);
				console.log(" \n");
				*/

				/* Check Warnings */
				if(glass_config.shared_network_warning_threshold > 0) {
					if (
						utilization >= glass_config.shared_network_warning_threshold &&
						utilization <= glass_config.shared_network_critical_threshold &&
						alert_status_networks_warning[dhcp_data['shared-networks'][i].location] == 0
					)
					{
						alert_status_networks_warning[dhcp_data['shared-networks'][i].location] = 1;
						slack_message(":warning: WARNING: DHCP shared network utilization (" + dhcp_data['shared-networks'][i].location + ") Current: (" + utilization + "%) Threshold: (" + glass_config.shared_network_warning_threshold + "%)");
					}
					else if (
						utilization <= glass_config.shared_network_warning_threshold &&
						alert_status_networks_warning[dhcp_data['shared-networks'][i].location] == 1
					)
					{
						alert_status_networks_warning[dhcp_data['shared-networks'][i].location] = 0;
						slack_message(":white_check_mark: CLEAR: Warning DHCP shared network utilization (" + dhcp_data['shared-networks'][i].location + ") Current: (" + utilization + "%) Threshold: (" + glass_config.shared_network_warning_threshold + "%)");
					}
				}

				/* Check Critical */
				if(glass_config.shared_network_critical_threshold > 0) {
					if (
						utilization >= glass_config.shared_network_critical_threshold &&
						alert_status_networks_critical[dhcp_data['shared-networks'][i].location] == 0
					)
					{
						alert_status_networks_critical[dhcp_data['shared-networks'][i].location] = 1;
						slack_message(":fire: CRITICAL: DHCP shared network utilization (" + dhcp_data['shared-networks'][i].location + ") Current: (" + utilization + "%) Threshold: (" + glass_config.shared_network_critical_threshold + "%)");
					}
					else if (
						utilization <= glass_config.shared_network_critical_threshold &&
						alert_status_networks_critical[dhcp_data['shared-networks'][i].location] == 1
					)
					{
						alert_status_networks_critical[dhcp_data['shared-networks'][i].location] = 0;
						slack_message(":white_check_mark: CLEAR: Critical DHCP shared network utilization (" + dhcp_data['shared-networks'][i].location + ") Current: (" + utilization + "%) Threshold: (" + glass_config.shared_network_critical_threshold + "%)");
					}
				}
			}
		}
	}, (5 * 1000));
}, 60 * 1000);

function round(num, places) {
	var multiplier = Math.pow(10, places);
	return Math.round(num * multiplier) / multiplier;
}

console.log("[Glass Server] Bootup complete");