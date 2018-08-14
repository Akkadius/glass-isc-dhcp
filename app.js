var express      = require('express');
var path         = require('path');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
const execSync   = require('child_process').execSync;
var app          = express();
var json_file    = require('jsonfile');
var glass_config = json_file.readFileSync('config/glass_config.json');

/**
 * Init Express plugins
 */
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Check to see if we at least have one subnet allowed
 */
if (glass_config.ip_ranges_to_allow[0] !== "") {
	var ip_filter = require('express-ipfilter').IpFilter;
	var ips       = glass_config.ip_ranges_to_allow;
	app.use(ip_filter(ips, {mode: 'allow'}));
}

/**
 * Normal web routes
 */
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/get_stats', require('./routes/get_stats'));
app.use('/dhcp_statistics', require('./routes/dhcp_statistics_page'));
app.use('/dhcp_leases', require('./routes/dhcp_leases'));
app.use('/dhcp_lease_search', require('./routes/dhcp_lease_search'));
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

/**
 * API Routes
 */
app.use('/api/get_active_leases/', require('./api/get_active_leases'));
app.use('/api/get_subnet_details/', require('./api/get_subnet_details'));
app.use('/api/get_vendor_count/', require('./api/get_vendor_count'));
app.use('/api/get_mac_oui_count_by_vendor/', require('./api/get_mac_oui_count_by_vendor'));
app.use('/api/get_dhcp_requests/', require('./api/get_dhcp_requests'));
app.use('/api/get_server_info/', require('./api/get_server_info'));
app.use('/api/get_mac_oui_list/', require('./api/get_mac_oui_list'));
app.use('/api/get_glass_config/', require('./api/get_glass_config'));
app.use('/api/get_websocket_config/', require('./api/get_websocket_config'));

app.set('view engine', 'html');

/**
 * Catch 404
 */
app.use(function (req, res, next) {
	var err    = new Error('Not Found');
	err.status = 404;
	next(err);
});

/**
 * Error handler
 */
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error   = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.send(err.message);
});

module.exports              = app;
module.exports.glass_config = glass_config;

/**
 * App Globals
 */
global.cpu_utilization                = 0;
global.current_leases_per_second      = 0;
global.current_time                   = 0;
global.debug_watch_lease_parse_stream = 0;
global.dhcp_lease_data                = {};
global.dhcp_requests                  = {};
global.leases_last_update_time        = 0;
global.leases_per_minute              = 0;
global.leases_per_minute_counter      = 0;
global.leases_per_minute_data         = [];
global.leases_per_second              = 0;
global.listening_to_log_file          = 0;
global.oui_data                       = {};
global.total_leases                   = 0;
global.socket_clients                 = 0;

/**
 * Server hostname
 */
global.host_name = execSync("cat /etc/hostname").toString().replace("\n", "");

/**
 * Pull in core handlers
 */
let oui_reader  = require('./core/oui-reader');
let dhcp_leases = require('./core/dhcp-leases');
let glass_config_watcher = require('./core/glass-config-watcher');
let dhcp_log_watcher = require('./core/dhcp-log-watcher');
let app_timers = require('./core/app-timers');

/**
 * Run routines
 */
oui_reader.initOuiDatabase();
dhcp_leases.parseLeasesFileOnce(glass_config);
dhcp_leases.startLeaseListener(glass_config);
dhcp_leases.setLeasesCleanTimer();
glass_config_watcher.init();
dhcp_log_watcher.init(glass_config);

/**
 * Timers
 */
app_timers.clearStaleWebsocketConnectionsTimer();
app_timers.pollCpuUtilizationTimer();
app_timers.purgeRequestDataCompleteTimer();
app_timers.purgeRequestDataTimer();
app_timers.startDashboardTimer();
app_timers.startLeasesPerMinuteCalculator();

/**
 * Websockets
 */
const WebSocket = require('ws');
const ws_port   = glass_config.ws_port || 8080;

console.log("[Glass Server] Websocket server starting on port: " + ws_port);

global.wss = new WebSocket.Server({port: ws_port});

wss.on('connection', function connection(ws) {
	socket_clients++;
	console.log("[WS] CLIENT_CONNECT: Socket clients (" + socket_clients + ")");

	if (!listening_to_log_file) {
		listening_to_log_file = 1;
	}

});

wss.on('close', function close() {
	socket_clients--;
	console.log("[WS] CLIENT_DISCONNECT: Socket clients (" + socket_clients + ")");
});

wss.on('connection', function connection(ws) {
	ws.isAlive = true;
	ws.on('pong', heartbeat);
	ws.event_subscription = [];

	ws.on('message', function incoming(data) {
		if (data !== "" && isJson(data)) {
			var json = JSON.parse(data);
			if (typeof json["event_subscription"] !== "undefined") {
				console.log("[WS] Incoming Subscription '%s'", json['event_subscription']);
				ws.event_subscription[json["event_subscription"]] = 1;
			}
			if (typeof json["event_unsubscribe"] !== "undefined") {
				console.log("[WS] event_unsubscribe '%s'", json['event_unsubscribe']);
				delete ws.event_subscription[json["event_unsubscribe"]];
			}
			if (typeof json["all_events"] !== "undefined") {
				console.log("[WS] event_unsubscribe '%s'", json['event_unsubscribe']);
				ws.event_subscription = [];
			}
		}
	});

	stale_connections_audit();
});

get_socket_clients_connected_count = function () {
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			socket_clients++;
		}
	});
	return socket_clients;
};

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
			if (client.event_subscription[event])
				client.send(JSON.stringify({"event": event, "data": data}));
		}
	});
};

stale_connections_audit = function() {
	socket_clients = 0;
	wss.clients.forEach(function each(ws) {
		if (ws.isAlive === false) return ws.terminate();

		ws.isAlive = false;
		ws.ping('', false, true);

		socket_clients++;
	});

	console.log("[WS] STATUS: Socket clients (" + socket_clients + ")");
};

heartbeat = function() {
	this.isAlive = true;
};

isJson = function(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
};

are_clients_subscribed_to_ws_event = function(event) {
	if (typeof wss === "undefined")
		return false;

	var is_listening = false;

	wss.clients.forEach(function each(ws) {

		/**
		 * Count event listeners
		 */
		for (var event_listening in ws.event_subscription) {
			if (event_listening === event) {
				is_listening = true;
				return true;
			}
		}
	});

	return is_listening;
};



/**
 * Alert Checks
 */

alert_status = [];
alert_status['leases_per_minute'] = 0;
setTimeout(function () {
	console.log("[Glass Server] Alert loop started");

	let alert_check_timer = setInterval(function () {
		// console.log("[Timer] Alert Timer check");
		if (glass_config.leases_per_minute_threshold > 0) {
			// console.log("[Timer] lpm: %s lpm_th: %s", leases_per_minute, glass_config.leases_per_minute_threshold);
			if (leases_per_minute <= glass_config.leases_per_minute_threshold && alert_status['leases_per_minute'] === 0) {
				alert_status['leases_per_minute'] = 1;

				slack_message(":warning: CRITICAL: DHCP leases per minute have dropped below threshold " +
								  "(" + parseInt(glass_config.leases_per_minute_threshold).toLocaleString('en') + ") " +
								  "Current (" + parseInt(leases_per_minute).toLocaleString('en') + ")");

				email_alert("CRITICAL: Leases Per Minute Threshold", "DHCP leases per minute dropped below critical threshold <br><br>" +
					"Threshold: (" + parseInt(glass_config.leases_per_minute_threshold).toLocaleString('en') + ") <br>" +
					"Current: (" + parseInt(leases_per_minute).toLocaleString('en') + ") <br><br>" +
					"This is usually indicative of a process or hardware problem and needs to be addressed immediately");
			}
			else if (leases_per_minute >= glass_config.leases_per_minute_threshold && alert_status['leases_per_minute'] === 1) {
				alert_status['leases_per_minute'] = 0;

				slack_message(":white_check_mark: CLEAR: DHCP leases per minute have returned to above threshold " +
								  "(" + parseInt(glass_config.leases_per_minute_threshold).toLocaleString('en') + ") " +
								  "Current (" + parseInt(leases_per_minute).toLocaleString('en') + ")");

				email_alert("CLEAR: Leases Per Minute Threshold", "DHCP leases per minute have returned to normal <br><br>" +
					"Threshold: (" + parseInt(glass_config.leases_per_minute_threshold).toLocaleString('en') + ") <br>" +
					"Current: (" + parseInt(leases_per_minute).toLocaleString('en') + ")"
				);

			}
		}
	}, (5 * 1000));

	alert_status_networks_warning  = [];
	alert_status_networks_critical = [];

	let alert_subnet_check_timer = setInterval(function () {
		// console.log("[Timer] Alert Timer check - subnets");

		if (glass_config.shared_network_warning_threshold > 0 || glass_config.shared_network_critical_threshold > 0) {
			const execSync = require('child_process').execSync;
			output         = execSync('./bin/dhcpd-pools -c ' + glass_config.config_file + ' -l ' + glass_config.leases_file + ' -f j -A -s e');
			var dhcp_data  = JSON.parse(output);

			/*
			 * Iterate through Shared Networks
			 */
			for (var i = 0; i < dhcp_data['shared-networks'].length; i++) {
				utilization = round(parseFloat(dhcp_data['shared-networks'][i].used / dhcp_data['shared-networks'][i].defined) * 100, 2);

				if (isNaN(utilization))
					utilization = 0;


				/* Initialize these array buckets */
				if (typeof alert_status_networks_warning[dhcp_data['shared-networks'][i].location] === "undefined")
					alert_status_networks_warning[dhcp_data['shared-networks'][i].location] = 0;

				if (typeof alert_status_networks_critical[dhcp_data['shared-networks'][i].location] === "undefined")
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
				if (glass_config.shared_network_warning_threshold > 0) {
					if (
						utilization >= glass_config.shared_network_warning_threshold &&
						utilization <= glass_config.shared_network_critical_threshold &&
						alert_status_networks_warning[dhcp_data['shared-networks'][i].location] === 0
					) {
						alert_status_networks_warning[dhcp_data['shared-networks'][i].location] = 1;

						slack_message(":warning: WARNING: DHCP shared network utilization (" + dhcp_data['shared-networks'][i].location + ") " +
										  "Current: (" + utilization + "%) " +
										  "Threshold: (" + glass_config.shared_network_warning_threshold + "%)"
						);

						email_alert("WARNING: DHCP shared network utilization",
									"WARNING: DHCP shared network utilization (" + dhcp_data['shared-networks'][i].location + ") <br><br>" +
										"Threshold: (" + glass_config.shared_network_warning_threshold + "%) <br>" +
										"Current: (" + utilization + "%)"
						);

					}
					else if (
						utilization <= glass_config.shared_network_warning_threshold &&
						alert_status_networks_warning[dhcp_data['shared-networks'][i].location] === 1
					) {
						alert_status_networks_warning[dhcp_data['shared-networks'][i].location] = 0;

						slack_message(":white_check_mark: CLEAR: Warning DHCP shared network utilization (" + dhcp_data['shared-networks'][i].location + ") " +
										  "Current: (" + utilization + "%) " +
										  "Threshold: (" + glass_config.shared_network_warning_threshold + "%)"
						);

						email_alert("CLEAR: DHCP shared network utilization warning",
									"CLEAR: DHCP shared network utilization (" + dhcp_data['shared-networks'][i].location + ") <br><br>" +
										"Threshold: (" + glass_config.shared_network_warning_threshold + "%) <br>" +
										"Current: (" + utilization + "%)"
						);

					}
				}

				/* Check Critical */
				if (glass_config.shared_network_critical_threshold > 0) {
					if (
						utilization >= glass_config.shared_network_critical_threshold &&
						alert_status_networks_critical[dhcp_data['shared-networks'][i].location] === 0
					) {
						alert_status_networks_critical[dhcp_data['shared-networks'][i].location] = 1;
						slack_message(":fire: CRITICAL: DHCP shared network utilization (" + dhcp_data['shared-networks'][i].location + ") " +
										  "Current: (" + utilization + "%) " +
										  "Threshold: (" + glass_config.shared_network_critical_threshold + "%)"
						);

						email_alert("CRITICAL: DHCP shared network utilization",
									"CRITICAL: DHCP shared network utilization (" + dhcp_data['shared-networks'][i].location + ") <br><br>" +
										"Threshold: (" + glass_config.shared_network_critical_threshold + "%) <br>" +
										"Current: (" + utilization + "%)"
						);

					}
					else if (
						utilization <= glass_config.shared_network_critical_threshold &&
						alert_status_networks_critical[dhcp_data['shared-networks'][i].location] === 1
					) {
						alert_status_networks_critical[dhcp_data['shared-networks'][i].location] = 0;
						slack_message(":white_check_mark: CLEAR: Critical DHCP shared network utilization (" + dhcp_data['shared-networks'][i].location + ") " +
										  "Current: (" + utilization + "%) " +
										  "Threshold: (" + glass_config.shared_network_critical_threshold + "%)"
						);

						email_alert("CLEAR: DHCP shared network utilization",
									"CLEAR: DHCP shared network utilization (" + dhcp_data['shared-networks'][i].location + ") <br><br>" +
										"Threshold: (" + glass_config.shared_network_critical_threshold + "%) <br>" +
										"Current: (" + utilization + "%)"
						);
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

/* Load Mailer */
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport(
	{
		sendmail: true,
		newline:  'unix',
		path:     '/usr/sbin/sendmail'
	}
);

function email_alert(alert_title, alert_message) {
	if (typeof glass_config.email_alert_to === "undefined" && typeof glass_config.sms_alert_to === "undefined") {
		console.log("[Glass Server] E-Mail alert triggered, but no addresses configured...");
		return false;
	}

	console.log("[Glass Server] Loading E-Mail template...");
	var fs         = require('fs');
	var email_body = fs.readFileSync('./public/templates/email_template.html', "utf8");
	console.log("[Glass Server] Loading E-Mail template... DONE...");

	/* E-Mail Template Load */
	console.log("[Glass Server] Sending E-Mail Alert...\n");

	if (glass_config.email_alert_to === "" && glass_config.sms_alert_to !== "") {
		console.log("[Glass Server] No email_to specified - returning...");
		return false;
	}

	/* Write on top of E-Mail Template */
	email_body = email_body.replace("[body_content_placeholder]", alert_message);
	email_body = email_body.replace("[alert_title]", alert_title);
	email_body = email_body.replace("[local_time]", new Date().toString());

	/* Clean extra commas etc. */
	glass_config.email_alert_to = glass_config.email_alert_to.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,[,\s]*,/g, ',');

	/* Send regular HTML E-Mails */
	if (glass_config.email_alert_to.trim() !== "") {
		var mailOptions = {
			from:    "Glass Alerting Monitor glass@noreply.com",
			to:      glass_config.email_alert_to,
			subject: "[Glass] " + "(" + host_name + ") " + alert_title,
			html:    email_body,
		};
		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			}
			else {
				console.log('Message sent: ' + info.response);
			}
		});
	}

	/* Send SMS */
	if (glass_config.sms_alert_to.trim() !== "") {
		var mailOptions = {
			from:    "Glass Alerting Monitor glass@noreply.com",
			to:      glass_config.sms_alert_to,
			subject: "[Glass] " + "(" + host_name + ") " + alert_title,
			html:    (alert_message.substring(0, 130) + "..."),
		};
		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			}
			else {
				console.log('Message sent: ' + info.response);
			}
		});
	}
}

/**
 * Slack Hooks
 */

var Slack = require('slack-node');

webhookUri = glass_config.slack_webhook_url;

slack = new Slack();
slack.setWebhook(webhookUri);

function slack_message(message) {

	/**
	 * If webhook is not set in config, return
	 */
	if (glass_config.slack_webhook_url.trim() === "") {
		console.log("[Glass Server] Slack alert triggered, but no webhook configured...");
		return;
	}

	console.log("[Slack] %s", message);

	/**
	 * Send message
	 */
	slack.webhook(
		{
			channel:    glass_config.slack_alert_channel,
			username:   "Glass",
			icon_emoji: "https://imgur.com/wD3CcBi",
			text:       "(" + host_name + ") " + message
		},
		function (err, response) {
			console.log(response);
		}
	);
}

console.log("[Glass Server] Bootup complete");
