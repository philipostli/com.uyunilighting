import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();
import Homey from 'homey';
import { DeviceService } from './lib/DeviceService';
const UyuniRemoteDevice = require('./drivers/uyuni-lights/device');

enum Timers {
  TIMER_4H = 'TIMER_4H',
  TIMER_6H = 'TIMER_6H',
  TIMER_8H = 'TIMER_8H',
  TIMER_10H = 'TIMER_10H',
}

module.exports = class MyApp extends Homey.App {
  deviceService!: DeviceService;
  uyuniSignal!: Homey.SignalInfrared; 

  private async sendCommand(command: string) {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.uyuniSignal.cmd(command);
        return;
      } catch (err: any) {
        const isRetryable = err?.message?.includes('InfraredTransmitTimeout') ||
          err?.message?.includes('Sent Too Many IR Commands') ||
          err?.message?.includes('rmtIR');
        if (attempt < maxRetries && isRetryable) {
          await this.delay(500 * attempt);
        } else {
          throw err;
        }
      }
    }
  }

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('MyApp has been initialized');

    this.deviceService = new DeviceService(this.homey);
    this.uyuniSignal = this.homey.rf.getSignalInfrared('uyuni');


    this.homey.flow.getActionCard('turn-on').registerRunListener(async (args, state) => {
      await this.setOnOff(true);
      return; 
    })

    this.homey.flow.getActionCard('turn-off').registerRunListener(async (args, state) => {
      await this.setOnOff(false);
      return; 
    })

    //TODO (pronto_hex not working):
    // this.homey.flow.getActionCard('dim-up').registerRunListener(async (args, state) => {
    //   await this.sendCommand('DIM_UP');
    //   return; 
    // })

    // this.homey.flow.getActionCard('dim-down').registerRunListener(async (args, state) => {
    //   await this.sendCommand('DIM_DOWN');
    //   return; 
    // })

    this.homey.flow.getActionCard('timer-4h').registerRunListener(async (args, state) => {
      await this.setTimer(Timers.TIMER_4H);
      return; 
    })

    this.homey.flow.getActionCard('timer-6h').registerRunListener(async (args, state) => {
      await this.sendCommand('TIMER_6H');
      return;
    })

    this.homey.flow.getActionCard('timer-8h').registerRunListener(async (args, state) => {
      await this.sendCommand('TIMER_8H');
      return;
    })

    this.homey.flow.getActionCard('timer-10h').registerRunListener(async (args, state) => {
      await this.sendCommand('TIMER_10H');
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async setOnOff(setOn: boolean) {
    const devices: typeof UyuniRemoteDevice[] = this.homey.drivers.getDriver('uyuni-lights').getDevices();
    if (devices.length == 0) {
      if (setOn)
        await this.sendCommand('POWER_ON');
      else
        await this.sendCommand('POWER_OFF');
    } else {
      devices.forEach(device => {
        device.setCapabilityValue('onoff', setOn);
        if (!setOn)
          device.setCapabilityValue('timer_4h', false);
      });
      await devices[0].triggerCapabilityListener('onoff', setOn);
    }
  }

  private async setTimer(timer: Timers) {
    const devices: typeof UyuniRemoteDevice[] = this.homey.drivers.getDriver('uyuni-lights').getDevices();
    if (devices.length == 0) {
      await this.sendCommand('POWER_ON');
      await this.delay(500);
      await this.sendCommand(timer);
    } else {
      devices.forEach(device => {
        switch(timer) {
          case Timers.TIMER_4H:
            device.setCapabilityValue('timer_4h', true);
            break;
          default:
            break;
        }
      });
      if (timer === Timers.TIMER_4H && devices.length > 0) {
        await devices[0].triggerCapabilityListener('timer_4h', true);
      }
    }
  }

}
