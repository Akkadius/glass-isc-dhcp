[![npm](https://img.shields.io/npm/v/npm.svg)]()
[![CocoaPods](https://img.shields.io/cocoapods/l/AFNetworking.svg)]()

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
  * [Install NodeJS (If not installed)](#install-nodejs--if-not-installed-)
  * [Install Glass](#install-glass)
  * [Apparmor (Ubuntu LTS)](#apparmor--ubuntu-lts-)
    + [Option 1) Add file exemptions to apparmor (For glass and dhcpd)](#option-1--add-file-exemptions-to-apparmor--for-glass-and-dhcpd-)
    + [Option 2) Disable completely (not recommended)](#option-2--disable-completely--not-recommended-)
  * [Glass Configuration](#glass-configuration)
  * [Secure your Server](#secure-your-server)
    + [iptables (Recommended)](#iptables--recommended-)
  * [Building dhcpd-pools (Optional)](#building-dhcpd-pools--optional-)

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
* Currently config editing only supports editing one single config file (No includes) due to syntax verificiation that glass performs

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
* Glass alerts check once a minute for subnet utilization and every 5 seconds for lease-rate alerts
  * Shared Network Utilization % Thresholds (Warning & Critical) (Default 0 and 95)
  * Leases per minute rate (Default 50)
  * 0 values = Off
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

npm install
npm start
</pre>

* For Debian this is all that is needed and Glass should start immediately
* For Ubuntu users - you will have additional Apparmor config to add
* **Highly Recommended** to iptables port 3000 to close off Glass if you are facing the public on your server
* [Glass Process Keepalive](#glass-process-keepalive)

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
  "sms_alert_to": ""
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
