const util = require("util");
const Ssdp = require("../lib/Ssdp");
const MediaRendererClient = require("upnp-mediarenderer-client");

/**
 * @param {string} device
 */
const findDeviceUrl = (device) => {
    if (device.startsWith("http://") || device.startsWith("https://")) {
        return device;
    }
    let devices = Ssdp.getInstance().Devices();

    // find by usn
    if (devices[device]) {
        return devices[device].deviceUrl;
    }

    // find by friendly name
    for (var usn in devices) {
        let d = devices[usn];
        if (d.name === device) {
            return d.deviceUrl;
        }
    }

    throw new Error("device url not found");
};

module.exports = class MediaRenderer {
    constructor(device) {
        this._client = new MediaRendererClient(findDeviceUrl(device));

        this.play = util.promisify(this._client.play.bind(this._client));
        this.pause = util.promisify(this._client.pause.bind(this._client));
        this.stop = util.promisify(this._client.stop.bind(this._client));
    }

    static Scan() {
        Ssdp.getInstance().Scan();
    }

    static Renderers() {
        return Ssdp.getInstance().Devices();
    }

    load(url, options) {
        return new Promise((resolve, reject) => {
            this._client.load(url, options, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    /**
     * @returns {Promise<number>}
     */
    getVolume() {
        return new Promise((resolve, reject) => {
            this._client.getVolume((err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    /**
     * @param {number} volume
     */
    setVolume(volume) {
        return new Promise((resolve, reject) => {
            this._client.setVolume(volume, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }
};
