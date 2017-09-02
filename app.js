var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

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

/* Normal Web Routes */
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/get_dashboard', require('./routes/dashboard'));
app.use('/get_stats', require('./routes/get_stats'));
app.use('/dhcp_leases', require('./routes/dhcp_leases'));
app.use('/dhcp_log', require('./routes/dhcp_log'));
app.use('/api_examples', require('./routes/api_examples'));
app.use('/glass_settings', require('./routes/glass_settings'));
app.use('/glass_settings_save', require('./routes/glass_settings_save'));

/* API Routes */
app.use('/api/get_active_leases/', require('./api/get_active_leases'));
app.use('/api/get_subnet_details/', require('./api/get_subnet_details'));

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
cpu_utilization = 0;
total_leases = 0;

current_time = 0;
leases_per_second = 0;
current_leases_per_second = 0;
leases_last_update_time = 0;

listening_to_log_file = 0;

options = {};
options.interval = 1000;

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
	}
});

/**
 * Leases File Listener
 */
var tail_module = require('always-tail');
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

dashboard_timer = setInterval(function(){
	// console.log("Checking timers...");
	unix_time = Math.floor(new Date() / 1000);
	if((unix_time - 5) > leases_last_update_time){
		current_leases_per_second = 0;
    }

	// console.log(JSON.stringify(dhcp_lease_data, null, 2));

}, 5000);

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
 * Websocker Server
 */

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });


options.interval = 100;
var tail_dhcp_log = new tail_module(
	glass_config.log_file,
	"\n",
	options
);

tail_dhcp_log.on("line", function(data) {
	if(listening_to_log_file) {
		// console.log(data);
		wss.broadcast_event(data, 'dhcp_log_subscription');
	}
});

wss.on('connection', function connection(ws) {
	socket_clients++;
	console.log("[WS] CLIENT_CONNECT: Socket clients (" + socket_clients + ")");

	if (!listening_to_log_file) {
		/* Watch log file for new information */
		var tail_module = require('always-tail');

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