#!/usr/bin/env bash

exec bash -c "(echo $*; cat) | espeak -s 120 --stdout --stdin | aplay"
