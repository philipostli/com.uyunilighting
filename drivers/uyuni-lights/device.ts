'use strict';
const {RFDevice} = require('homey-rfdriver');
import {DeviceService} from '../../lib/DeviceService';

module.exports = class UyuniRemoteDevice extends RFDevice {
  deviceService!: DeviceService;
  debugLog!: string[];

  static CAPABILITIES = {
    onoff: {
      true: 'POWER_ON',
      false: 'POWER_OFF',
    },
    dim_up: 'DIM_UP',
    dim_down: 'DIM_DOWN'
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async sendCommand(command: string) {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.driver.cmd(command, { device: this });
        return;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const isRetryable = msg.includes('InfraredTransmitTimeout') ||
          msg.includes('Sent Too Many IR Commands') ||
          msg.includes('rmtIR');
        if (attempt < maxRetries && isRetryable) {
          await this.delay(500 * attempt);
        } else {
          throw err;
        }
      }
    }
  }
  

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('UyuniRemoteDevice has been initialized');

    this.deviceService = new DeviceService(this.homey);
    this.debugLog = [];

    await this.migrateSettings();
    await this.migrateCapabilities();

    this.registerCapabilityListener('onoff', async (state: boolean) => {
      if (state) {
        await this.sendCommand('POWER_ON');
        this.homey.log('UyuniRemoteDevice is set on');
      } else {
        await this.sendCommand('POWER_OFF');
        this.homey.log('UyuniRemoteDevice is set off');
        this.triggerCapabilityListener('timer_4h', false); 
      }
    })

    this.registerCapabilityListener('timer_4h', async (startTimer: boolean) => {
      const timerDuration = 4 * 60;
      if (startTimer) {
        await this.triggerCapabilityListener('onoff', true);
        await this.delay(500);
        await this.sendCommand('TIMER_4H');
        await this.deviceService.setTimer(timerDuration);
      } else
        this.deviceService.deleteTimer();
    })
  }

  private async migrateSettings() {
    // Initialize log setting if it doesn't exist
    if (!this.getSettings().log) {
      await this.setSettings({ log: '' });
    }
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
    oldSettings: {[key: string]: boolean | string | number | undefined | null};
    newSettings: {[key: string]: boolean | string | number | undefined | null};
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

    /**
   * Push a logline onto the debug log visible to user
   *
   * @param {string} line - Line to log
   */
    protected logToDebug(line: string) {
      this.debugLog.push(`[${new Date().toJSON()}] ${line}`);
      if (this.debugLog.length > 50) this.debugLog.shift();
      this.log(line);
    }

    /**
   * Push current cache of debug log into the device settings view.
   *
   * This makes it visible to the user, but we don't want to constantly
   * push data to the Homey settings module. We should trigger this function
   * periodically.
   */
  protected updateDebugLog() {
    this.setSettings({ log: this.debugLog.join('\n') }).catch((e: any) =>
      this.error('Failed to update debug log', e),
    );
  }


};
