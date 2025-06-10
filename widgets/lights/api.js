'use strict';
import { Device } from 'homey';

module.exports = {
  async getState({ homey, query }) {
    const selectedDeviceId = query.deviceId;
    const devices = homey.drivers.getDriver('uyuni-lights').getDevices();
    const selectedDevice = devices.find(device => device.getId() === selectedDeviceId);
    let state;
    if (devices.length == 0) {
      return {
        status: 'error',
        message: 'No devices found',
      };
    } else {
      state = selectedDevice.getCapabilityValue('onoff');
    }

    return {
      status: 'ok',
      message: state,
    };
  },

  async turnOn({ homey, query, body }) {
    const selectedDeviceId = query.deviceId;
    const devices = homey.drivers.getDriver('uyuni-lights').getDevices();
    const selectedDevice = devices.find(device => device.getId() === selectedDeviceId);
    if (devices.length == 0) {
      return {
        status: 'error',
        message: 'No devices found',
      };
    } else {
      selectedDevice.setCapabilityValue('onoff', body.state);
    }

    selectedDevice.triggerCapabilityListener('onoff', body.state);

    return {
      status: 'ok',
      message: 'State changed',
    };
  },

};
