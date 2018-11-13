#!/bin/bash
source /home/ec2-user/.bash_profile
cd /var/games/sprocketleague
PORT=3003 npm start >sprocketleague.out 2>sprocketleague.err &
