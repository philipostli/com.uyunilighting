import {Device} from 'homey';
import cron, {ScheduledTask} from 'node-cron';

export class DeviceService {
  private homey: any;
  private timer: number = 0;
  private task: cron.ScheduledTask | null = null;
  private taskStopped = false;

  constructor(homey: any) {
      this.homey = homey;
  }

  async setTimer(duration: number) {
    this.deleteTimer();
    this.timer = duration;
    this.taskStopped = false;
    this.homey.drivers.getDriver('uyuni-lights').getDevices().forEach( (device: Device) => {
      device.setCapabilityValue('meter_timer', duration);
      device.setCapabilityValue('timer_4h', true);
      device.setCapabilityValue('onoff', true);
    })
    this.task = cron.schedule('* * * * *', () => this.updateTimer().catch(() => {}));
    // this.homey.log("Timer activated " + duration.toString());
  }

  async updateTimer() {
    if (this.taskStopped) return;
    const devices = this.homey.drivers.getDriver('uyuni-lights').getDevices();
    this.timer--;
    if (this.timer < 0) this.timer = 0;
    devices.forEach((device: Device) => {
      device.setCapabilityValue('meter_timer', this.timer);
    });
    if (this.timer <= 0) {
      this.deleteTimer();
      if (devices.length > 0) {
        await devices[0].triggerCapabilityListener('onoff', false);
      }
    }
  }

  async deleteTimer() {
    if (this.task){
      this.task.stop();
      this.taskStopped = true;
      // this.homey.log("Timer stopped");
    }
    this.timer = 0;
    this.homey.drivers.getDriver('uyuni-lights').getDevices().forEach( (device: Device) => {
      device.setCapabilityValue('meter_timer', 0);
      device.setCapabilityValue('timer_4h', false);
    })
  }
  
}