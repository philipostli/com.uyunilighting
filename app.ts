'use strict';

import Homey from 'homey';

module.exports = class MyApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('MyApp has been initialized');

    const uyuniSignal = this.homey.rf.getSignalInfrared('uyuni');


    this.homey.flow.getActionCard('turn-on').registerRunListener(async (args, state) => {
      await uyuniSignal.cmd('POWER_ON');
      return; 
    })

    this.homey.flow.getActionCard('turn-off').registerRunListener(async (args, state) => {
      await uyuniSignal.cmd('POWER_OFF');
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
      await uyuniSignal.cmd('TIMER_4H');
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

  }

}
