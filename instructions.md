# Hardware

This is what I used.  If you know what you're doing, you can
substitute any piece.

1. rotary phone
2. [raspberry pi](http://www.raspberrypi.org/buy/)
1. [8G Micro SD card w/ SD adapter](http://www.adafruit.com/products/1294)
1. [USB Audio Adapter](http://www.adafruit.com/products/1475)
2. 4x [10k ohm resistors](http://www.radioshack.com/product/index.jsp?productId=2062330)
2. 5x [motherboard standoffs](http://www.amazon.com/StarTech-Replacement-Mounting-Metal-Standoff/dp/B00213K9MI/ref=sr_1_14?ie=UTF8&qid=1404781167&sr=8-14&keywords=motherboard+standoffs)
3. 5x [motherboard screws](http://www.amazon.com/StarTech-Mounting-Computer-4-Inches-Standoff/dp/B00032Q1J4/ref=pd_sim_sbs_e_3?ie=UTF8&refRID=02XF7F39G1PXQTBYQQEM)
1. [Jumper wires](http://www.adafruit.com/product/794)
1. [Wire connectors](http://www.radioshack.com/product/index.jsp?productId=2103501)
1. 2x [micro speakers](http://www.parts-express.com/1-1-8-x-1-9-16-neodymium-micro-speaker-8-ohm--280-002)
1. [Stereo plug](http://www.adafruit.com/products/1800)
1. [USB MicroB Female Plug](http://www.adafruit.com/products/1829)
1. [USB MicroB Male Plug](http://www.adafruit.com/products/1390)
1. [Polycarbonate Sheet](http://www.homedepot.com/p/LEXAN-10-in-x-8-in-Polycarbonate-Sheet-31-GE-XL-1/202090134?N=5yc1vZbrdg)

# Assmebly

## Cut the polycarbonate sheet

## Drill holes in sheet

## Attach Pi to sheet

## Attach sheet to phone base

## Wiring for phone

## Speakers in receiver

## USB power connection

# Software Installation

## Download Arch Linux ARM

Download from [archlinuxarm.org](http://archlinuxarm.org/platforms/armv6/raspberry-pi)

    linux$ wget -nc http://archlinuxarm.org/os/ArchLinuxARM-rpi-latest.zip
    linux$ wget -nc http://archlinuxarm.org/os/ArchLinuxARM-rpi-latest.zip.md5

Check the integrity of the download

    linux$ cat http://archlinuxarm.org/os/ArchLinuxARM-rpi-latest.zip.md5
    linux$ md5sum http://archlinuxarm.org/os/ArchLinuxARM-rpi-latest.zip

The two md5sums should agree

## Write image to (Micro) SD card

Less terse instructions [here](http://elinux.org/RPi_Easy_SD_Card_Setup#Create_your_own)

    linux# unzip ArchLinuxARM-rpi-latest.zip
    linux$ dd bs=1M if=./ArchLinuxARM*.img of=/dev/sdX # replace X with location of SD card

This will take some time

## Resize partition on SD card

The image we wrote to the SD card was only 2G.  To make use of
additional space on the card (if any) we need to resize the partition.

Instructions [here](http://elinux.org/RPi_Resize_Flash_Partitions)

I used `gparted` on my linux box, and it worked fine.

## Put card in Pi and boot

For this step, you'll need to connect the USB port of the Pi to power,
and the network cable to a LAN.

You should see some blinking lights on the Pi

## Connect to the Pi

    linux$ ssh root@alarmpi.local # will prompt for password

### Update arch code

    alarmpi# pacman -Syu

### Install required software

    alarmpi# pacman -S nodejs rsync parallel mpc mpd espeak alsa-utils git

### Install the piphone package

    alarmpi# npm install git://github.com/steven-gardiner/piphone.git
    alarmpi# ln ~/node_modules/piphone/tts.js /usr/local/bin/tts
    alarmpi# ln ~/node_modules/piphone/mpc_query.sh /usr/local/bin/mpc_query

### optionally configure asound for USB audio adapter

(based on information from [here](http://www.raspberrypi.org/forums/viewtopic.php?t=38316&p=333438))

    alarmpi# ln ~/node_modules/piphone/asound.conf /etc/asound.conf

### optionally place sample MP3s for mpd

    alarmpi# mkdir -p /var/lib/mpd/music/samples
    alarmpi# (cd /var/lib/mpd/music/samples; bash ~/node_modules/piphone/samples.sh)

### Configure mpd 

    alarmpi# ln ~/node_modules/piphone/mpd.conf /etc/mpd.conf
    alarmpi# mkdir -p /var/lib/mpd/music
    alarmpi# systemctl enable mpd
    alarmpi# systemctl start mpd
    alarmpi# mpc random on
    alarmpi# mpc single on

### Place music in mpd music directory

    linux$ rsync -av /path/to/music/* root@alarmpi.local:/var/lib/mpd/music/

### Update mpd playlist

    alarmpi# mpc --wait update 
    alarmpi# mpc --wait clear
    alarmpi# mpc listall | mpc add

### configure piphone listeners to run at startup

    alarmpi# cat ~/node_modules/*/crontab.txt | crontab -

### reboot

Before rebooting, you may disconnect the network cable; you should not
need it again.

Also, you can connect the jumpers to the GPIO pins.

    alarmpi# reboot



