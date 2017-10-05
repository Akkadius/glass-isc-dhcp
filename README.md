[![npm](https://img.shields.io/npm/v/npm.svg)]()
[![CocoaPods](https://img.shields.io/cocoapods/l/AFNetworking.svg)]()

# Glass <img src="https://user-images.githubusercontent.com/3319450/31204769-06a0f9da-a933-11e7-87d5-efda1059ccfe.png" alt="Glass" width="20" height="20">
* Glass was created as a quick side project out of necessity to fulfill requirements not readily available through our production ISC DHCP Servers for our organization - I've decided to share it for anyone who would also find it useful
* More features and application-level things could be extended into the interface but my goals were simply the high yield features for our production network needs

## Features
  * Standalone NodeJS application that has a web interface, listens to the dhcp log and the leases file to collect analytics and data realtime
  * DHCP IPv4 Support (No IPv6 at this time)
  * Full OUI Database
    * Has complete vendor to MAC OUI database - with a script to pull down and update live data
  * Realtime Alerting
    * Shared Subnet Utilization Alerting
      * Customize thresholds (IE: Warning: 80% Critical 95%)
    * Leases Per Minute - If your disk fills up - or your SAN is unavailable - alerting your team on absolutely zero activity on your production server can allow you to be on the 8 ball
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

## Dashboard
* Glass has a dashboard containing quick-glance important information pertaining to the health of the server and the pools configured
  * DHCP Leases per second / minute
  * Total Active Leases
  * Server CPU Utilization
  * Shared Network Utilization
  * Subnet Utilization

![dashboard_1](https://user-images.githubusercontent.com/3319450/31204215-6b805826-a930-11e7-8e07-4731c958bda4.gif)

## DHCP Config Editing
* A built in config web editor that uses the dhcp server binary to check syntax before over-writing the production config with a bad configuration

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
* Glass has a small but powerful REST API exposing data not otherwise available easily through raw isc-dhcp-server formats

![api_examples](https://user-images.githubusercontent.com/3319450/31204191-3e197804-a930-11e7-871e-2c469480b906.gif)

# Alerting
* Glass currently supports the following alerting methods

## E-Mail

<img src="https://user-images.githubusercontent.com/3319450/31207443-e4dc71e2-a943-11e7-804f-49f3b656861a.png" width="500">

## Slack

![snip20171004_11](https://user-images.githubusercontent.com/3319450/31207501-2e9fda58-a944-11e7-99b3-cdab2ae3f81f.png)

