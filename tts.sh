#!/usr/bin/env bash

if [[ -p /dev/stdin || -f /dev/stdin ]]
then
    echo "stdin is coming from a pipe/file"
    exec bash -c "(echo $*; cat) | espeak -s 120 --stdout --stdin | aplay"
fi

exec bash -c "(echo $*) | espeak -s 120 --stdout --stdin | aplay"
