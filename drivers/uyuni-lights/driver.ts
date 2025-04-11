import PairSession from 'homey/lib/PairSession';
const {RFDriver} = require('homey-rfdriver');
const Signal = require('./signal');

module.exports = class UyuniRemoteDriver extends RFDriver {

  static SIGNAL = Signal;

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('UyuniRemoteDriver has been initialized');
  }

  async onPair(session: PairSession) {
    session.setHandler('list_devices', this.listDevices.bind(this));
  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async listDevices(data: any): Promise<any> {
    try {
      // Get all existing devices
      const existingDevices = this.getDevices();
      
      // Find the next available number for uyuni-remote-N
      const existingIds = existingDevices.map((device: any) => device.getData().id);
      let nextNumber = 1;
      while (existingIds.includes(`uyuni-remote-${nextNumber}`)) {
        nextNumber++;
      }

      // Return a new device with the next available number
      return [{
        name: `Uyuni Remote ${nextNumber}`,
        data: {
          id: `uyuni-remote-${nextNumber}`
        },
        settings: {
          satellite_mode_antenna: 'self'
        }
      }];
    } catch (error) {
      this.error('Error getting available devices:', error);
      return [];
    }
  }
};
