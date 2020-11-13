[![npm](https://img.shields.io/npm/v/npm.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<h1> <img src="https://user-images.githubusercontent.com/3319450/31204769-06a0f9da-a933-11e7-87d5-efda1059ccfe.png" alt="Glass" width="35" height="35"> Glass </h1>

* Glass was created as a quick side project out of necessity to fulfill requirements not readily available through our production ISC DHCP Servers for our organization - I've decided to share it for anyone who would also find it useful
* More features and application-level things could be extended into the interface but my goals were simply the high yield features for our production network needs
* Disclaimer: Glass and its author has no affiliation with ISC and the authors of isc-dhcp-server
* Original Author: Chris Miles: chris.miles.e@gmail.com

**Table of Contents**

- [Features](#features)
  * [Dashboard](#dashboard)
  * [DHCP Config Editing](#dhcp-config-editing)
  * [DHCP Config Snapshots](#dhcp-config-snapshots)
  * [DHCP Server Restart](#dhcp-server-restart)
  * [Statistics](#statistics)
  * [Log Streaming](#log-streaming)
  * [Glass API](#glass-api)
- [Alerting](#alerting)
  * [E-Mail](#e-mail)
  * [Slack](#slack)
  * [SMS - Simple Format](#sms---simple-format)
- [Installation](#installation)
  * [Install NodeJS (If not installed)](#install-nodejs-if-not-installed)
  * [Install Glass (as root)](#install-glass-as-root)
  * [Apparmor](#apparmor)
  * [Glass Configuration](#glass-configuration)
  * [Glass Process Keepalive](#glass-process-keepalive)
  * [Secure your Server](#secure-your-server)
    + [iptables (Recommended)](#iptables--recommended-)
  * [Building dhcpd-pools (Optional)](#building-dhcpd-pools--optional-)
- [Glass API](#glass-api-1)
  * [Use Cases](#use-cases)
  * [Example Calls](#example-calls)
    + GET: /api/get_active_leases
    + GET: /api/get_subnet_details
    + GET: /api/get_mac_oui_list
    + GET: /api/get_server_info
    + GET: /api/get_vendor_count
    + GET: /api/get_mac_oui_count_by_vendor
    + GET: /api/get_dhcp_requests

# Features
  * Standalone NodeJS application that has a web interface, listens to the dhcp log and the leases file to collect analytics and data realtime
  * DHCP IPv4 Support (No IPv6 at this time)
  * Full OUI Database
    * Has complete vendor to MAC OUI database - with a script to pull down and update live data
  * Realtime Alerting
    * Shared Subnet Utilization Alerting
      * Customize thresholds (IE: Warning: 80% Critical 95%)
    * Leases Per Minute - If your disk fills up - or your SAN is unavailable - alerting your team on absolutely zero activity on your production server can allow you to be on the 8-ball. This is a step-above process alerting because you can have the dhcp server process running and no leases being written
  * Alerting Destinations
    * Slack
    * E-Mail
    * SMS
  * Statistics (Available through REST API)
    * Shared Network Utilization
    * Individual Network Utilization
    * Vendor Counts by MAC
    * OUI Count
    * Excessive DHCP Requests
   * Log Streaming (Realtime via Websockets)
   * Lease Data
     * Full active DHCP lease data available via API and searchable through the web interface
     * All options are dynamically parsed into an easy to ingest JSON format
   * Config Edit (Only supports single DHCP config file configurations)
     * Edit the DHCP config using a full web-based text editor (Ace)
     * Before saving the config - Glass will run a syntax check against the file
     * Config editing through Glass creates a backup (snapshot) on success with no syntax errors and commits to production file
    * Start / Stop / Restart server process
    * Administrative Authentication enforced on administrative tasks (Restarts/Config/Glass Settings)
 * Uses [AdminBSB UI](https://github.com/gurayyarar/AdminBSBMaterialDesign) with customizations and tweaks
 * Full Mobile support

## Dashboard
* Glass has a dashboard containing quick-glance important information pertaining to the health of the server and the pools configured - statistics update in realtime
  * DHCP Leases per second / minute
  * Total Active Leases
  * Server CPU Utilization
  * Shared Network Utilization
  * Subnet Utilization

![dashboard_1](https://user-images.githubusercontent.com/3319450/31204215-6b805826-a930-11e7-8e07-4731c958bda4.gif)

## DHCP Config Editing
* A built in config web editor that uses the dhcp server binary to check syntax before over-writing the production config with a bad configuration
* Currently config editing only supports editing one single config file (No includes) due to syntax verification that glass performs

![dhcp_config](https://user-images.githubusercontent.com/3319450/31204509-bb583c00-a931-11e7-982c-186ef8c33e61.gif)

## DHCP Config Snapshots
* Mess up a config? Snapshots are quickly available through the snapshots sidebar as long as you've been editing the config through the Glass interface

![dhcp_config_snapshots](https://user-images.githubusercontent.com/3319450/31204512-bd1f07da-a931-11e7-810d-41f88ca55265.gif)

## DHCP Server Restart
* Server Stop / Start / Restarting can all be done through the Glass interface

![dhcp_server_restart](https://user-images.githubusercontent.com/3319450/31204517-c06001ba-a931-11e7-8e8a-1bf2779b9497.gif)

## Statistics
* Glass exposes useful statistical information in the Web interface that is also available through the raw API interface

![statistics_1](https://user-images.githubusercontent.com/3319450/31204863-80c1cf82-a933-11e7-8682-ac3ebffeb6f5.gif)

## Log Streaming
* Stream the DHCP syslog via Websockets to your browser, making troubleshooting efforts super easy by being able to add realtime filters and have MAC address be translated realtime to the vendor for readability

![dhcp_log_stream_filter](https://user-images.githubusercontent.com/3319450/31205190-9c97e4b0-a935-11e7-9c2c-d26f476cfa14.gif)

![log_stream](https://user-images.githubusercontent.com/3319450/31204870-89cccc94-a933-11e7-97fc-27547c90892c.gif)

## Glass API
* Glass has a small but powerful REST API exposing data not otherwise available easily through raw isc-dhcp-server data formats

![api_examples](https://user-images.githubusercontent.com/3319450/31204191-3e197804-a930-11e7-871e-2c469480b906.gif)

# Alerting
* **Realtime Alerting** One of our biggest high value returns on this project was creating something that can keep us on top of any sort of outage issues. 
  * "Is our server writing leases even though the process is alive?"
  * "Is any our shared networks filling up?"
* **Shared Subnet Utilization Alerting** (Checked once a minute)
    * Customize thresholds
      * Default 80 (Warning)
      * Default 95 (Critical)
* **Leases Per Minute** (Checked once every 5 seconds) - If your disk fills up - or your SAN is unavailable - alerting your team on absolutely zero activity on your production server can allow you to be on the 8-ball. This is a step-above process alerting because you can have the dhcp server process running and no leases being written.
  * **Default**: 50
  * Glass keeps track of a rolling average of leases being written on the minute, the counter can be seen realtime on the dashboard
* 0 value in **Glass Settings** or in your **glass_config.json** will turn the alerting functionality **OFF**

## Alert Delivery Methods
* Glass currently supports the following alerting delivery methods

## E-Mail

<img src="https://user-images.githubusercontent.com/3319450/31207443-e4dc71e2-a943-11e7-804f-49f3b656861a.png" width="500">

## Slack

<img src="https://user-images.githubusercontent.com/3319450/31207501-2e9fda58-a944-11e7-99b3-cdab2ae3f81f.png" width="500">

## SMS - Simple Format
* SMS gets cut off at 140 characters - but you get the core alert and should only be used as a backup measure to other methods

<img src="https://user-images.githubusercontent.com/3319450/31207663-40cf573e-a945-11e7-8753-288e68a38da1.jpg" width="300">

# Installation
* Instructions are per Debian/Ubuntu Distros

## Install NodeJS (If not installed)

<pre>
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
</pre>

## Install Glass (as root)
<pre>
cd /opt
git clone https://github.com/Akkadius/glass-isc-dhcp.git
cd glass-isc-dhcp
mkdir logs
chmod u+x ./bin/ -R
chmod u+x *.sh

sudo npm install
sudo npm install forever -g
sudo npm start
</pre>

* For Debian this is all that is needed and Glass should start immediately, you can browse via http://server-ip:3000
* For Ubuntu users - you will have additional Apparmor config to add
* **Recommended** to iptables port 3000 to close off Glass if you are facing the public on your server
* **Recommended** to keep Glass up through reboots, see [Glass Process Keepalive](#glass-process-keepalive)

## Apparmor

* Ubuntu uses AppArmor by default - you will most likely run into file access issues without exemptions

<pre>
sed -i '/\/etc\/dhcp\/\*\*/a\ \ \/var\/lib\/dhcp\/\*\* lrw,' /etc/apparmor.d/usr.sbin.dhcpd 
sed -i '/\/etc\/dhcp\/\*\*/a\ \ \/opt\/glass-isc-dhcp\/\*\* lrw,' /etc/apparmor.d/usr.sbin.dhcpd 
service apparmor restart
</pre>

## Glass Configuration
* Glass configuration is stored in **./config/glass_config.json**
* All of these settings can be edited in both Glass Settings and Glass Alerts within the Web Interface, if you have custom file locations you will need to edit this config file before starting

**Defaults**
<pre>
{
  "admin_user": "glassadmin",
  "admin_password": "glassadmin",
  "leases_file": "/var/lib/dhcp/dhcpd.leases",
  "log_file": "/var/log/dhcp.log",
  "config_file": "/etc/dhcp/dhcpd.conf",
  "shared_network_critical_threshold": "95",
  "shared_network_warning_threshold": "0",
  "slack_webhook_url": "",
  "slack_alert_channel": "",
  "leases_per_minute_threshold": "50",
  "ip_ranges_to_allow": [
    ""
  ],
  "email_alert_to": "",
  "sms_alert_to": "",
  "ws_port": 8080,
  "date_format": "YYYY-MM-DD",
  "time_format": "HH:mm:ss"
}
</pre>

## Glass Process Keepalive
* To keep your server alive through reboots, possible crashes and process restarts, we need to use a process monitor and for simplicity we will use NodeJS's **Forever**. Forever is already installed during Glass installation. We will add it to our **crontab**

<pre>
crontab -l > mycrontab
echo "@reboot cd /opt/glass-isc-dhcp && /usr/bin/forever --minUptime 10000 --spinSleepTime 10000 -a -o ./logs/glass-process.log -e ./logs/glass-error.log ./bin/www" >> mycrontab
crontab mycrontab
rm mycrontab
</pre>

## Secure your Server

* Glass runs on web port 3000 - if you're going to run this on a production server, make sure that you lock it down from the outside world if anyone can access it. Even if they don't have a password - vulnerabilities can surface at any point in the future and your system becomes a prime target

### iptables (Recommended)
<pre>
iptables -A INPUT -p tcp --dport 3000 -s 127.0.0.0/8 -j ACCEPT
iptables -A INPUT -p tcp --dport 3000 -s x.x.x.x/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 3000 -j REJECT --reject-with icmp-port-unreachable
</pre>

## Building dhcpd-pools (Optional)

* Glass uses dhcpd-pools for shared network / subnet utilization and it is bundled by default (For Ubuntu and Debian) when you install. However, if you need to build the binary yourself on another distribution, use the following to build dhcpd-pools and it needs to be placed in the ./bin directory of glass
* Below shows use of apt-get of unzip/libtool - you will have to use your respective package management system to pull pre-requisites down
* Credit: dhcpd-pools: http://dhcpd-pools.sourceforge.net/

<pre>
sudo apt-get install -y unzip
sudo apt-get install -y libtool

git clone https://github.com/Akkadius/dhcpd-pools.git

cd /tmp
wget https://github.com/troydhanson/uthash/archive/master.zip
unzip master.zip

cd /tmp/dhcpd-pools
./bootstrap	# only when building git clone
./configure --with-uthash=/tmp/uthash-master/include
make -j4
make check
make install
</pre>

# Glass API

## Use Cases
* If none of the in-web management features are appealing - at the very least the exposed real time data the Glass agent can expose via the API can be valuable in integrating with 3rd party applications. For example - if you need to query 5 DHCP servers for one device on a network - this makes it incredibly efficient to do so with real-time and accurate data
* If you want to get all subnet details/utilization exposed into a 3rd party application, (For example graphing utilization in grafana) you can use the API calls to ingest into your InfluxDB or otherwise

## Example Calls

### GET: /api/get_active_leases
* This call will return the full lease list unless you pass optional search parameter:
  * Ex: /api/get_active_leases?search=Cisco

**Output example truncated - some info redacted**
<pre>
  "64.90.X.X": {
    "start": 1507177832,
    "end": 1507181432,
    "mac": "14:91:82:6e:77:0a",
    "mac_oui_vendor": "Belkin International Inc.",
    "options": {
      "ClientMac": "14:91:82:6e:77:a",
      "ClientIP": "64.90.X.X",
      "vendor-class-identifier": "udhcp 1.19.4",
      "vendor-string": "udhcp 1.19.4",
      "agent.remote-id": "3:c:0:0:d1:d4:29:81:f6:3:2:8a:0:be"
    },
    "host": "Vargo"
  },
  "209.212.X.X": {
    "start": 1507177401,
    "end": 1507181001,
    "mac": "20:aa:4b:12:bd:9b",
    "mac_oui_vendor": "Cisco-Linksys, LLC",
    "options": {
      "ClientMac": "20:aa:4b:12:bd:9b",
      "ClientIP": "209.212.X.X",
      "agent.remote-id": "3:c:0:0:d1:d4:29:81:f6:3:1:4e:4:51"
    },
    "host": "snarley55"
  },
...
</pre>

### GET: /api/get_subnet_details

**Output example truncated - some info redacted**
<pre>
{
  "subnets": [
    {
      "location": "69.168.x.x/26",
      "range": "69.168.x.x - 69.168.x.x",
      "defined": 55,
      "used": 0,
      "touched": 0,
      "free": 55
    },
    {
      "location": "10.70.48.0/21",
      "range": "10.70.48.2 - 10.70.55.254",
      "defined": 2045,
      "used": 0,
      "touched": 0,
      "free": 2045
    },
...
</pre>

### GET: /api/get_mac_oui_list

**Output example truncated - some info redacted**
<pre>
{
  "100000": "Private",
  "100501": "PEGATRON CORPORATION",
  "100723": "IEEE Registration Authority",
  "101212": "Vivo International Corporation Pty Ltd",
  "101218": "Korins Inc.",
  "101248": "ITG, Inc.",
  "101250": "Integrated Device Technology (Malaysia) Sdn. Bhd.",
  "101331": "Technicolor",
  "102279": "ZeroDesktop, Inc.",
...
</pre>

### GET: /api/get_server_info

**Output example**
<pre>
{
  "cpu_utilization": 3.1,
  "leases_per_second": 4,
  "leases_per_minute": 310,
  "host_name": "DHCP-Server"
}
</pre>

### GET: /api/get_vendor_count

**Output example truncated**
<pre>
{
  "Belkin International Inc.": 1230,
  "Cisco-Linksys, LLC": 1345,
  "Calix Inc.": 4368,
  "Billion Electric Co. Ltd.": 404,
  "Apple, Inc.": 528,
  "Wistron Corporation": 18,
  "ASUSTek COMPUTER INC.": 266,
  "Zyxel Communications Corporation": 320,
  "Billion Electric Co., Ltd.": 611,
  "NETGEAR": 2797,
  "Cisco Systems, Inc": 65,
  "Hewlett Packard": 87,
  "Sonicwall": 11,
...
</pre>

### GET: /api/get_mac_oui_count_by_vendor

**Output example truncated**
<pre>
{
  "149182": {
    "count": 131,
    "mac_prefix": "149182",
    "vendor": "Belkin International Inc."
  },
  "180373": {
    "count": 4,
    "mac_prefix": "180373",
    "vendor": "Dell Inc."
  },
  "186590": {
    "count": 1,
    "mac_prefix": "186590",
    "vendor": "Apple, Inc."
  },
...
</pre>

### GET: /api/get_dhcp_requests

**Output example truncated - some info redacted**
<pre>
{
  "20:aa:4b:1d:d0:17": {
    "request_for": "68.170.X.X",
    "request_via": "209.212.X.X",
    "request_count": 139,
    "request_vendor": "Cisco-Linksys, LLC"
  },
  "58:6d:8f:aa:37:6a": {
    "request_for": "68.170.X.X",
    "request_via": "209.212.X.X",
    "request_count": 171,
    "request_vendor": "Cisco-Linksys, LLC"
  },
...
</pre>
