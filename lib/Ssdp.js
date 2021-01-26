const NodeSsdp = require("node-ssdp");
const fetch = require("node-fetch").default;
const Xml = require("../lib/xml");

/**
 *
 * @typedef {Object} SSdpDevice
 * @property {string} deviceUrl
 * @property {string} name
 */

class Ssdp {
    static _Init() {
        /**
         * @private
         * @type {Object.<string, SSdpDevice>}
         */
        this._Devices = {};
        /** @private */
        this._Client = new NodeSsdp.Client();

        this._Client.on("response", async (headers, statusCode, rinfo) => {
            this._Devices[headers.USN] = {
                "deviceUrl": headers.LOCATION,
                "name": headers.USN
            };
            //this._Devices[headers.USN].headers = headers;
            //this._Devices[headers.USN].rinfo = rinfo;

            try {
                // get friendly name
                let response = await fetch(headers.LOCATION);
                let xmlString = await response.text();
                let description = await Xml.parseString(xmlString);
                this._Devices[headers.USN].name = description.root.device[0].friendlyName[0];
                //this._Devices[headers.USN].description = description;
            } catch (error) {
                // ignore invalid responses
                console.debug("error when fetching the device description: ", error);
            }
        });

        //this._Client.search("ssdp:all");
        this._Client.search("urn:schemas-upnp-org:device:MediaRenderer:1");
    }

    /**
     * @returns {Object.<string, SSdpDevice>}
     */
    static Devices() {
        return this._Devices;
    }
}
Ssdp._Init();

module.exports = Ssdp;
