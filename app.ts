'use strict';

import Homey from 'homey';
import {DeviceService} from './lib/DeviceService';

module.exports = class MyApp extends Homey.App {
  deviceService!: DeviceService;

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('MyApp has been initialized');

    this.deviceService = new DeviceService(this.homey);

    const uyuniSignal = this.homey.rf.getSignalInfrared('uyuni');


    this.homey.flow.getActionCard('turn-on').registerRunListener(async (args, state) => {
      this.setOnOff(true);
      return; 
    })

    this.homey.flow.getActionCard('turn-off').registerRunListener(async (args, state) => {
      this.setOnOff(false);
      return; 
    })

    //TODO (pronto_hex not working):
    // this.homey.flow.getActionCard('dim-up').registerRunListener(async (args, state) => {
    //   await uyuniSignal.cmd('DIM_UP');
    //   return; 
    // })

    // this.homey.flow.getActionCard('dim-down').registerRunListener(async (args, state) => {
    //   await uyuniSignal.cmd('DIM_DOWN');
    //   return; 
    // })

    this.homey.flow.getActionCard('timer-4h').registerRunListener(async (args, state) => {
      await this.setTimer(4);
      return; 
    })

    this.homey.flow.getActionCard('timer-6h').registerRunListener(async (args, state) => {
      await uyuniSignal.cmd('TIMER_6H');
      return; 
    })

    this.homey.flow.getActionCard('timer-8h').registerRunListener(async (args, state) => {
      await uyuniSignal.cmd('TIMER_8H');
      return; 
    })

    this.homey.flow.getActionCard('timer-10h').registerRunListener(async (args, state) => {
      await uyuniSignal.cmd('TIMER_10H');
      return; 
    })

    this.homey.flow.getConditionCard('timer-is-active').registerRunListener(async (args, state) => {
      let isActive = false;
      this.homey.drivers.getDriver('uyuni-lights').getDevices().forEach(device => {
        isActive = (device.getCapabilityValue('meter_timer') > 0)
        // this.homey.log('isActive' + isActive);
      });
      return isActive;
    })
  }

  private async setOnOff(setOn : boolean) {
    this.homey.drivers.getDriver('uyuni-lights').getDevices().forEach(device => {
      device.setCapabilityValue('onoff', setOn);
      device.triggerCapabilityListener('onoff', setOn);
      if (!setOn)
        device.setCapabilityValue('timer_4h', false);
    })
  }

  private async setTimer(duration : number) {
    this.homey.drivers.getDriver('uyuni-lights').getDevices().forEach(device => {
      switch(duration) {
        case 4:            
          device.setCapabilityValue('timer_4h', true);
          device.triggerCapabilityListener('timer_4h', true);
          break;
        default:
          break;
      }
    })
  }

}
