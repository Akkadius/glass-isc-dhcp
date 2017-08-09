var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

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
app.use('/api_examples', require('./routes/api_examples'));

/* API Routes */
app.use('/api/get_active_leases/', require('./api/get_active_leases'));

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

/* Tail leases file */
current_time = 0;
leases_per_second = 0;
current_leases_per_second = 0;
leases_last_update_time = 0;

options = {};
options.interval = 1000;

var lease_parser = require('./lib/lease_parser.js');
dhcp_lease_data = {};
lease_read_buffer = "";

fs = require('fs');
fs.readFile('/var/lib/dhcp/dhcpd.leases', 'utf8', function (err,data) {
	if (err) {
		return console.log(err);
	}

	lease_parser.parse(data);
	// console.log(JSON.stringify(dhcp_lease_data, null, 2));
});

var tail_module = require('always-tail');
tail = new tail_module(
	"/var/lib/dhcp/dhcpd.leases",
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

/* Globals */
cpu_utilization = 0;
total_leases = 0;

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