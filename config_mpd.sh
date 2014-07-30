mkdir -p /var/lib/mpd/music
ln -f /usr/lib/node_modules/piphone/mpd.conf /etc/mpd.conf
systemctl enable mpd
systemctl start mpd
mpc random on
mpc single on

