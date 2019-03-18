const system = require('system-control')();

system.audio.getSystemVolume().then(function(volume) {
  console.log(volume)
});

system.audio.setSystemVolume(75).then(function() {
  console.log('done')
});