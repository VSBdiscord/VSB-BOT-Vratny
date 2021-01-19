#!/bin/bash
firstSetup=false;
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"




if [ $firstSetup == True ]; then

crontab -l | { cat; echo "* * * * * "; } | crontab

fi