const ExclusiveKeyboard = require('./index');

const keyboard = new ExclusiveKeyboard('by-id/usb-Logitech_Logitech_USB_Keyboard-event-kbd', true);
keyboard.on('keyup', console.log);
keyboard.on('keydown', console.log);
keyboard.on('keypress', console.log);
keyboard.on('error', console.error);

console.log(keyboard.Keys);
