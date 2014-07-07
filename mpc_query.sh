#!/usr/bin/env bash

MPC="mpc"

#echo 0 $0 
#echo 1 $1 
#echo 2 $2 


${MPC} --format "%position% %title% %artist% %title% %file" playlist | 
grep -i $1 |
head -1 | 
cut -d ' ' -f1
