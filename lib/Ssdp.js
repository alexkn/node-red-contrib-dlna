const NodeSsdp = require("node-ssdp");
const fetch = require("node-fetch").default;

const parseXmlString  = (xml) => {
    return new Promise((resolve, reject) => {
        var parseString = require("xml2js").parseString;
        parseString(xml, function (err, result) {
            if(err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

/**
 *
 * @typedef {Object} SSdpDevice
 * @property {string} deviceUrl
 * @property {string} name
 */

class Ssdp {
    /** @private */
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

            // get friendly name
            let response = await fetch(headers.LOCATION);
            let xmlString = await response.text();
            let description = await parseXmlString(xmlString);
            this._Devices[headers.USN].name = description.root.device[0].friendlyName[0];
            //this._Devices[headers.USN].description = description;
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
