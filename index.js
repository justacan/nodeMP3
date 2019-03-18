const fs = require('fs');
const lame = require('lame');
const wav = require('wav');
const Speaker = require('speaker');

const makeSpeaker = () => {
  return new Speaker({
    channels: 2,          // 2 channels
    bitDepth: 16,         // 16-bit samples
    sampleRate: 44100     // 44,100 Hz sample rate
  });
}

const makeDecoder = (type) => {
  const types = {
    mp3: new lame.Decoder,
    wav: new wav.Reader
  }
  return types[type]
}

const getFileType = (filePath) => {
  const matches = filePath.match(/\.(.*?)$/);
  if (!matches) return false;
  return matches[1];
}

class Player {
  constructor() {
    this.speaker = makeSpeaker();
    this.decoder = makeDecoder();
    this.stream = null;
    this.queue = [];
    this.queuePosition = 0;
    this.isRepeating = false;
    this.isLooping = false;
    this.stopCalled = false;
    this.isPlaying = false;
  }

  getStatus() {
    const {isLooping, isRepeating, stopCalled, isPlaying, queue, queuePosition} = this;
    return {isLooping, isRepeating, stopCalled, isPlaying, queue, queuePosition};
  }

  loop(value) {
    this.isLooping = value;
  }
  
  repeat(value) {
    this.isRepeating = value;
  }
  

  add(filePath) {
    this.queue.push(filePath);
  }

  next() {
    if (this.queuePosition + 1 >= this.queue.length) {
      if (this.isRepeating) {
        this.queuePosition = 0;
      } else {
        return false;
      }
    } else {
      this.queuePosition++
    }
    
    this.open(this.queue[this.queuePosition]);
  }

  play() {
    if (this.queue.length) {
      this.open(this.queue[this.queuePosition]);
    }
  }
  
  open(filePath) {
    this.stream = fs.createReadStream(filePath)
    .pipe(makeDecoder(getFileType(filePath)))
    .pipe(makeSpeaker());

    this.stream.on('open', () => {
      // console.log('Open');
      this.isPlaying = true
    });
    this.stream.on('close', () => {
      // console.log('Close')
      this.isPlaying = false
    });

    this.stream.on('flush', () => {
      if (this.stopCalled) {
        this.stopCalled = false;
        return;
      }
      if (this.isLooping) {
        this.open(filePath);
        return;
      }
      this.next();
    });
  }

  pause() {
    this.stream.cork();
  }

  resume() {
    this.stream.uncork();
  }

  stop() {
    this.stopCalled = true;
    this.stream.end();
  }

}

const player = new Player();
player.add(`sounds/piano2.wav`);
player.add(`sounds/test.mp3`);
// player.loop(true);
player.play();
player.repeat(true);