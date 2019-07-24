'use strict';

const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const ioctl = require('bindings')('ioctl.node').ioctl;

const keycodes = require('./keyscodes');
const EV_KEY = 1;
const EVENT_TYPES = ['keyup','keypress','keydown'];

const parse = (input, buffer) => {
  let event = undefined;
  if (buffer.readUInt16LE(16) === EV_KEY) {
    event = {
      timeS: buffer.readUInt16LE(0),
      timeMS: buffer.readUInt16LE(8),
      keyCode: buffer.readUInt16LE(18)
    };
    event.keyId = keycodes[event.keyCode];
    event.type = EVENT_TYPES[buffer.readUInt32LE(20)];
  }
  return event;
};

module.exports = class ExclusiveKeyboard extends EventEmitter {
  constructor(dev) {
    super();
    if (dev === undefined) {
      throw new Error('Device is not defined.');
    }
    this.dev = dev;
    this.bufferSize = 24;
    this.buffer = new Buffer(this.bufferSize);
    this.data = fs.createReadStream('/dev/input/' + this.dev);

    this.data.on('open', this.onOpen.bind(this));
    this.data.on('data', this.onData.bind(this));
    this.data.on('error', this.onError.bind(this));
  }

  onOpen(fd) {
    this.fd = fd;
    // exclusively grab device
    ioctl(this.fd, 1);
  }

  onData(data) {
    this.buffer = data.slice(24);
    var event = parse(this, this.buffer);
    if (event) {
      event.dev = this.dev;
      this.emit(event.type, event);
    }
  }

  onRead(bytesRead) {
    var event = parse(this, this.buf);
    if( event ) {
      event.dev = this.dev;
      this.emit(event.type, event);
    }
    if (this.fd) this.startRead();
  }

  onError(error) {
    this.emit('error', error);
    throw new Error(error);
  }

  close() {
    // release device
    ioctl(this.fd, 0);
    fs.close(this.fd, () => {
      this.emit('close', this);
    });
    this.fd = undefined;
  }
}

module.exports.Keys = keycodes;
