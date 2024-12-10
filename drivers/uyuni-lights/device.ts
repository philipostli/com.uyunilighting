const { RFDevice } = require('homey-rfdriver');
import {DeviceService} from '../../lib/DeviceService';

module.exports = class UyuniRemoteDevice extends RFDevice {
  deviceService!: DeviceService;

  static CAPABILITIES = {
    onoff: {
      true: 'POWER_ON',
      false: 'POWER_OFF',
    },
    dim_up: 'DIM_UP',
    dim_down: 'DIM_DOWN'
  }

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('UyuniRemoteDevice has been initialized');

    this.deviceService = new DeviceService(this.homey);

    this.migrateCapabilities();

    this.registerCapabilityListener('onoff', async (state: boolean) => {
      if (state){
        await this.driver.cmd('POWER_ON');
        this.homey.log('UyuniRemoteDevice is set on');
      }else{
        await this.driver.cmd('POWER_OFF');
        this.homey.log('UyuniRemoteDevice is set off');
        this.triggerCapabilityListener('timer_4h', false); 
      }
    })

    this.registerCapabilityListener('timer_4h', async (startTimer: boolean) => {
      if (startTimer){
        this.triggerCapabilityListener('onoff', true); 
        await this.driver.cmd('TIMER_4H');
        await this.deviceService.setTimer(4*60);
      } else
        this.deviceService.deleteTimer();
    })
  }

  
  private async migrateCapabilities() {
    if (!this.hasCapability('meter_timer'))  await this.addCapability('meter_timer');
    if (!this.hasCapability('timer_4h')) await this.addCapability('timer_4h');
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('UyuniRemoteDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log("UyuniRemoteDevice settings where changed");
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('UyuniRemoteDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('UyuniRemoteDevice has been deleted');
    this.deviceService.deleteTimer();
  }


};
