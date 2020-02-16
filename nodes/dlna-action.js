const MediaRendererClient = require("upnp-mediarenderer-client");
const Ssdp = require("../lib/Ssdp");

/**
 *
 * @param {string} device
 */
const findDeviceUrl = (device) => {
    if(device.startsWith("http://") || device.startsWith("https://")) {
        return device;
    }
    let devices = Ssdp.Devices();

    // find by usn
    if(devices[device]) {
        return devices[device].deviceUrl;
    }

    // find by friendly name
    for (var usn in devices) {
        let d = devices[usn];
        if(d.name === device) {
            return d.deviceUrl;
        }
    }
};

module.exports = function(RED) {
    function DlnaAction(config) {
        RED.nodes.createNode(this,config);

        this.device = config.device;

        this.on("input", (msg, send, done) => {
            let device = msg.device || this.device;
            if(!device) {
                done("No device specified");
                return;
            }
            let deviceUrl = findDeviceUrl(device);
            if(!deviceUrl) {
                done("No device url found.");
                return;
            }
            let client = new MediaRendererClient(deviceUrl);

            let callback = (err, result) => {
                if(err) {
                    done(err);
                } else {
                    msg.payload = result;
                    send(msg);
                    done();
                }
            };

            switch(msg.payload.action) {
                case "play":
                    client.play(callback);
                    break;
                case "pause":
                    client.pause(callback);
                    break;
                case "stop":
                    client.stop(callback);
                    break;
                case "load":
                    client.load(msg.payload.url, msg.payload.options, callback);
            }
        });
    }

    RED.nodes.registerType("dlna-action", DlnaAction);

    RED.httpAdmin.get("/dlna/devices", (req, res) => {
        res.send(Ssdp.Devices());
    });
};
