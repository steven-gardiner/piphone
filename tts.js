#!/usr/bin/env node

var tts = {};

tts.mods = {};
tts.mods.cp = require('child_process');

tts.procs = {}

//tts.procs.espeak = tts.mods.cp.spawn('espeak', ['-w', '/tmp/utter.wav', '--stdin']);
tts.procs.espeak = tts.mods.cp.spawn('espeak', ['--stdout', '--stdin']);

if (false) {
  tts.procs.lame = tts.mods.cp.spawn('lame', ['-', '/tmp/utter.mp3']);

  tts.procs.espeak.stdout.pipe(tts.procs.lame.stdin);
  tts.procs.espeak.stderr.pipe(process.stderr);

  tts.procs.lame.stdout.pipe(process.stderr);
  tts.procs.lame.stderr.pipe(process.stderr);

  tts.procs.lame.stdout.on('end', function() {
    tts.procs.play = tts.mods.cp.spawn('mpg123', ['/tmp/utter.mp3']);
      
    tts.procs.play.on('exit', function() {
      process.exit();
    });
  });
} else {
  tts.procs.aplay = tts.mods.cp.spawn('aplay', []);

  tts.procs.espeak.stdout.pipe(tts.procs.aplay.stdin);
  tts.procs.espeak.stderr.pipe(process.stderr);
}

tts.procs.espeak.stdout.on('_end', function() {
  tts.procs.aplay = tts.mods.cp.spawn('aplay', ['/tmp/utter.wav']);

  tts.procs.aplay.on('exit', function() {
    process.exit();
  });
});


//process.stdin.pipe(tts.procs.espeak.stdin);

process.stdin.setEncoding('utf8');

process.argv.slice(2).forEach(function(arg) {
  tts.procs.espeak.stdin.write(arg);
  tts.procs.espeak.stdin.write("\n");
});
process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    //console.error("NONNULL");
    tts.procs.espeak.stdin.write(chunk);
  } else {
    //console.error("NULL");
    tts.procs.espeak.stdin.end();
    //setTimeout(function() { process.exit(); }, 500);
  }
});
process.stdin.on('end', function() {
  //tts.procs.espeak.stdin.end();
});
