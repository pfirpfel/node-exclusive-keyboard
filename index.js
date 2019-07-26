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
  /**
   * @param dev Device name (part after '/dev/input/'). Example: 'event0' would use '/dev/input/event0'
   * @param exclusive Grab device exclusively using ioctl EVIOCGRAB (default: true)
   */
  constructor(dev, exclusive) {
    super();
    if (dev === undefined) {
      throw new Error('Device is not defined.');
    }
    this.dev = dev;
    this.exclusive = exclusive !== false; // true if undefined
    this.bufferSize = 24;
    this.buffer = Buffer.alloc(this.bufferSize);
    this.data = fs.createReadStream('/dev/input/' + this.dev);

    const onOpen = (fd) => {
      this.fd = fd;
      if (this.exclusive) {
        // exclusively grab device
        ioctl(this.fd, 1);
      }
    };

    const onData = (data) => {
      this.buffer = data.slice(24);
      const event = parse(this, this.buffer);
      if (event) {
        event.dev = this.dev;
        this.emit(event.type, event);
      }
    };

    const onError = (error) => {
      this.emit('error', error);
      throw new Error(error);
    };

    this.data.on('open', onOpen);
    this.data.on('data', onData);
    this.data.on('error', onError);
  }

  /**
   * Releases the grabbed device and closes the file descriptor.
   * Emits 'close' event when done.
   */
  close() {
    if (this.exclusive) {
      // release device
      ioctl(this.fd, 0);
    }
    fs.close(this.fd, () => {
      this.emit('close', this);
    });
    this.fd = undefined;
  }
}

module.exports.Keys = keycodes;
