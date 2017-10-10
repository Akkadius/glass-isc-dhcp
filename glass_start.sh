#!/usr/bin/env bash

/usr/bin/forever --minUptime 10000 --spinSleepTime 10000 -a -o ./logs/glass-process.log -e ./logs/glass-error.log ./bin/www &