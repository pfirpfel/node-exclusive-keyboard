'use strict';

const fs = require('fs');
const arch = require('arch');
const EventEmitter = require('events').EventEmitter;
const eviocgrab = require('bindings')('eviocgrab.node').eviocgrab;

const keycodes = require('./keyscodes');
const EV_KEY = 1;
const EVENT_TYPES = ['keyup', 'keypress', 'keydown'];
const is64bit = arch() === 'x64';

const parse = (input, buffer) => {
  const timestampLen = is64bit ? 16 : 8;
  let event = undefined;
  if (buffer.readUInt16LE(timestampLen) === EV_KEY) {
    event = {
      timeS: buffer.readUInt16LE(0),
      timeMS: buffer.readUInt16LE(timestampLen / 2),
      keyCode: buffer.readUInt16LE(timestampLen + 2)
    };
    event.keyId = keycodes[event.keyCode];
    event.type = EVENT_TYPES[buffer.readUInt32LE(timestampLen + 4)];
  }
  return event;
}

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
    this.bufferSize = is64bit ? 24 : 16;
    this.buffer = Buffer.alloc(this.bufferSize);
    this.data = fs.createReadStream('/dev/input/' + this.dev);

    const onOpen = (fd) => {
      this.fd = fd;
      if (this.exclusive) {
        // exclusively grab device
        eviocgrab(this.fd, 1);
      }
    };

    const onData = (data) => {
      this.buffer = data.slice(is64bit ? 24 : 16);
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
      eviocgrab(this.fd, 0);
    }
    fs.close(this.fd, () => {
      this.emit('close', this);
    });
    this.fd = undefined;
    // close the read stream
    this.data.destroy();
  }
}

module.exports.Keys = keycodes;
