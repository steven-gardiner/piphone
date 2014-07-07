#!/usr/bin/env node

var piphone = {};

piphone.mods = {};
piphone.mods.gpiobutton = require('gpiobutton');
piphone.mods.cp = require('child_process');

piphone.hook = new piphone.mods.gpiobutton.button({name:'hook', gpiono:22, DOWN:1});
piphone.dial = new piphone.mods.gpiobutton.button({name:'dial', gpiono:27});
piphone.rotary = new piphone.mods.gpiobutton.button({name:'rotary', gpiono:17, interval:30, DOWN:1});
piphone.onoff = new piphone.mods.gpiobutton.button({name:'switch', gpiono: 18});

piphone.onoff.on('buttonup', function() {
  piphone.onoff.enabled = true;
});
piphone.onoff.on('longpress', function() {
  if (! piphone.onoff.enabled) { return; }
  setTimeout(function() {
    piphone.mods.cp.exec('shutdown -h now', function(err, stdout, stderr) {    
      console.error("SHUTDOWN: %j", {err:err,stdout:stdout,stderr:stderr});    
    });    
  }, 1000);
});

piphone.dial.on('buttondown', function() {
  piphone.rotary.activate();
});
piphone.dial.on('buttonup', function() {
  piphone.rotary.deactivate();
});

piphone.hook.on('longpress', function() {
  piphone.mods.cp.exec('mpc pause', function(err, stdout, stderr) {    
    console.error("STOP: %j", {err:err,stdout:stdout,stderr:stderr});    
  });
});

piphone.rotary.on('multipress', function(spec) {
  console.error("ROTARY: " + spec.count);
  switch (spec.count) {
    case 1:
      process.emit("volume", {volume:60});
      process.emit("mpc", {cmd:'play'});
      break;
    case 2:
      process.emit("volume", {volume:100});
      process.emit("mpc", {cmd:'play'});
      break;
    case 3:
      process.emit("volume", {volume:60});
      process.emit("mpc", {cmd:'next'});
      break;
    case 4:
      process.emit("volume", {volume:100});
      process.emit("mpc", {cmd:'next'});
      break;
    case 5:
      process.emit("volume", {volume:60});
      process.emit("mpc", {cmd:'prev'});
      break;
    case 6:
      process.emit("volume", {volume:100});
      process.emit("mpc", {cmd:'prev'});
      break;
    case 10:
      var tts = piphone.mods.cp.exec('/usr/local/bin/tts');
      tts.stdin.write("how much wood would a wood chuck chuck if a woodchuck would chuck wood?\n");
      tts.stdin.end();
      break;
  }
});
piphone.rotary.on('buttonpress', function(spec) {
  piphone.rotary.emit('multipress', spec);
});



process.on('mpc', function(spec) {
  piphone.mods.cp.exec(['mpc',spec.cmd].join(" "), function(err, stdout, stderr) {    
    console.error("%s: %j", spec.cmd, {err:err,stdout:stdout,stderr:stderr});    
  });
});
process.on('volume', function(spec) {
  piphone.mods.cp.exec(['mpc','volume',spec.volume].join(" "), function(err, stdout, stderr) {    
    console.error("VOL: %j", {vol:spec.volume,err:err,stdout:stdout,stderr:stderr});    
  });
});
