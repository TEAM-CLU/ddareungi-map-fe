require('@testing-library/jest-dom');

const { setTw } = require('./src/shared/libs/tw-helper');
const { create } = require('tailwind-rn');
const utilitiesJson = require('./styles.json');
setTw(create(utilitiesJson));
