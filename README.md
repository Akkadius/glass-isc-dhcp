# Glass

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

## Glass API
* Glass has a small but powerful REST API exposing data not otherwise available easily through raw isc-dhcp-server formats

![api_examples](https://user-images.githubusercontent.com/3319450/31204191-3e197804-a930-11e7-871e-2c469480b906.gif)
