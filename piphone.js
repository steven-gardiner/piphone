#!/usr/bin/env node

var piphone = {};

piphone.mods = {};
piphone.mods.gpiobutton = require('gpiobutton');
piphone.mods.cp = require('child_process');

piphone.hook = new piphone.mods.gpiobutton.button({name:'hook', gpiono:22, DOWN:1});
piphone.dial = new piphone.mods.gpiobutton.button({name:'dial', gpiono:27});
piphone.rotary = new piphone.mods.gpiobutton.button({name:'rotary', gpiono:17, interval:30, DOWN:1});
piphone.onoff = new piphone.mods.gpiobutton.button({name:'switch', gpiono: 18});

piphone.code = {};
piphone.code.curr = [];

piphone.rotary.on('multipress', function(spec) {
  piphone.code.curr.push(spec.count);

  if (piphone.code.unlisten) {
    clearTimeout(piphone.code.unlisten);
  }

  var code = piphone.code.curr.join("");
  //console.error("CODE: %j %s", piphone.code.curr, code);

  switch (code) {
    case "1178":
      process.emit('shutdown_request');
      break;
    case "1165":
      process.emit('audible_status');
      break;
    case "11": 
      piphone.rotary.code = true;
      process.emit('tts', {text:['okay','okay']});
      break;
  }

  piphone.code.unlisten = setTimeout(function() {
    //console.error("UNLISTEN");
    piphone.code.curr = [];
    piphone.rotary.code = false;
    delete piphone.code.unlisten;
  }, 4000);
});

piphone.onoff.on('buttonup', function() {
  piphone.onoff.enabled = true;
});
piphone.onoff.on('longpress', function() {
  if (! piphone.onoff.enabled) { return; }
  process.emit('shutdown_request');
});

process.on('shutdown_request', function() {
  piphone.mods.cp.exec('mpc stop', function(err, stdout, stderr) {    
    console.error("STOP: %j", {err:err,stdout:stdout,stderr:stderr});    
  });
  process.emit("tts", {text:['goodbye cruel world']});
  setTimeout(function() {
    piphone.mods.cp.exec('shutdown -h now', function(err, stdout, stderr) {    
      console.error("SHUTDOWN: %j", {err:err,stdout:stdout,stderr:stderr});    
    });    
  }, 10000);
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
  //console.error("ROTARY: " + spec.count);
  if (piphone.rotary.code) { return; }
  //console.error("ROTARY! " + spec.count);
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
    case 7:
      process.emit("volume", {volume:100});
      process.emit("mpcq", {query:['guapo']});
      break;
    case 8:
      process.emit("volume", {volume:100});
      process.emit("mpcq", {query:['belafonte','matilda']});
      break;
    case 9:
      process.emit("volume", {volume:100});
      process.emit("mpcq", {query:['susanna','tanyas']});
      break;
    case 10:
      process.emit("volume", {volume:100});
      process.emit("mpcq", {query:['puff']});
      break;
    case 11:
      process.emit("tts", {text:['how much wood would a wood chuck chuck if a woodchuck would chuck wood?']});
      tts.stdin.end();
      break;
  }
});
piphone.rotary.on('buttonpress', function(spec) {
  piphone.rotary.emit('multipress', spec);
});

process.on('tts', function(spec) {
  var tts = piphone.mods.cp.spawn('/usr/bin/tts', spec.text);
  tts.stdout.pipe(process.stdout);
  tts.stderr.pipe(process.stderr);
  //tts.stdin.write(spec.text.concat(['\n']).join(" "));;
  //tts.stdin.end();
});

process.on('audible_status', function(spec) {
  var stat = piphone.mods.cp.spawn('bash', ['-c', 'mpc | head -1 | tts']);

  stat.stdout.pipe(process.stderr);
  stat.stderr.pipe(process.stderr);
  //tts.stdin.write(spec.text.concat(['\n']).join(" "));;
  //tts.stdin.end();
});

process.on('mpcq', function(spec) {
    //process.emit('tts', {text:spec.query});
    var mpc = piphone.mods.cp.exec(['/usr/bin/mpc_query',spec.query.join(".*")].concat([
      '|',
      'xargs mpc play'
    ]).join(" "), function(err,stdout,stderr) {
    //console.error("DEMAND: %j", {err:err,stdout:stdout,stderr:stderr});    
  });
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
