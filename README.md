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

const keyboard = new ExclusiveKeyboard('by-id/usb-Logitech_Logitech_USB_Keyboard-event-kbd');
keyboard.on('keyup', console.log);
keyboard.on('keydown', console.log);
keyboard.on('keypress', console.log);
keyboard.on('close', console.log);
keyboard.on('error', console.error);
```
