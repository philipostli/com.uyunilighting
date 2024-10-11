import PairSession from 'homey/lib/PairSession';
const {RFDriver} = require('homey-rfdriver');
const Signal = require('./signal');

module.exports = class MyDriver extends RFDriver {

  static SIGNAL = Signal;

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('MyDriver has been initialized');
  }


  async onPair(session: PairSession) {

    session.setHandler('list_devices', this.listDevices.bind(this));
  }



  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async listDevices(data: any): Promise<any> {
    this.homey.log('listDevices called');
    return [
      // Example device data, note that `store` is optional
      {
        name: 'Uyuni Remote',
        data: {
          id: 'uyuni-remote',
        },
      },
    ];
  }

};
