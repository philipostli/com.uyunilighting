'use strict';
import { Device } from 'homey';

module.exports = {
  async getState({ homey, query }) {
    const devices = homey.drivers.getDriver('uyuni-lights').getDevices();
    let state;
    if (devices.length == 0) {
      return {
        status: 'error',
        message: 'No devices found',
      };
    } else {
      state = devices[0].getCapabilityValue('onoff');
    }

    return {
      status: 'ok',
      message: state,
    };
  },

  async turnOn({ homey, params, body }) {
    const devices = homey.drivers.getDriver('uyuni-lights').getDevices();
    if (devices.length == 0) {
      return {
        status: 'error',
        message: 'No devices found',
      };
    } else {
      devices[0].setCapabilityValue('onoff', body.state);
    }

    devices[0].triggerCapabilityListener('onoff', body.state);

    return {
      status: 'ok',
      message: 'State changed',
    };
  },

};
