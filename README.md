# node-exclusive-keyboard
Keylogger for NodeJS and Linux that grabs the input device exclusively.

Useful for capturing USB input devices that act like keyboards, so that their inputs do no pollute other processes like terminals.

Based on [node-keylogger](https://github.com/taosx/node-keylogger/) and [node-ioctl](https://github.com/santigimeno/node-ioctl).

## Installation
```bash
npm install --save exclusive-keyboard
```

## Usage

Set access control right to device for user `username`:
```bash
sudo setfacl -m u:username:r /dev/input/by-id/usb-Logitech_Logitech_USB_Keyboard-event-kbd
```

```js
const ExclusiveKeyboard = require('exclusive-keyboard');

const keyboard = new ExclusiveKeyboard('by-id/usb-Logitech_Logitech_USB_Keyboard-event-kbd', true);
keyboard.on('keyup', console.log);
keyboard.on('keydown', console.log);
keyboard.on('keypress', console.log);
keyboard.on('close', console.log);
keyboard.on('error', console.error);
```

## API

### `new ExclusiveKeyboard(dev, exclusive)`
* `dev` (string): Device name (part after '/dev/input/'). Example: 'event0' would use '/dev/input/event0'
* `exclusive` (boolean): If true, grab device exclusively using ioctl EVIOCGRAB (default: true)

### `close()`
Releases the grabbed device and closes the file descriptor. Emits 'close' event when done.

### ExclusiveKeyboard.Keys
Mapping of key codes to key ids, see `keycodes.js`.

### Event `keyup(event)`
Example event:
```js
{
  timeS: 39234,
  timeMS: 3812,
  keyCode: 71,
  keyId: 'KEY_KP7',
  type: 'keyup',
  dev: 'by-id/usb-SEM_Trust_Numpad-event-kbd'
}
```

### Event `keypress(event)`
Example event:
```js
{
  timeS: 39234,
  timeMS: 3812,
  keyCode: 71,
  keyId: 'KEY_KP7',
  type: 'keypress',
  dev: 'by-id/usb-SEM_Trust_Numpad-event-kbd'
}
```

### Event `keydown(event)`
```js
{
  timeS: 39234,
  timeMS: 3812,
  keyCode: 71,
  keyId: 'KEY_KP7',
  type: 'keydown',
  dev: 'by-id/usb-SEM_Trust_Numpad-event-kbd'
}
```

### Event `error(error)`

### Event `close()`
