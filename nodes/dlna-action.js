const MediaRenderer = require("../lib/MediaRenderer");
const fetch = require("node-fetch").default;

module.exports = function(RED) {
    function DlnaAction(config) {
        RED.nodes.createNode(this,config);

        this.on("input", async (msg, send, done) => {
            let device = msg.device || config.device;
            if (!device) {
                done("No device specified");
                return;
            }

            try {
                let client = new MediaRenderer(device);

                switch (msg.payload.action) {
                    case "play":
                        msg.payload = await client.play();
                        break;
                    case "pause":
                        msg.payload = await client.pause();
                        break;
                    case "stop":
                        msg.payload = await client.stop();
                        break;
                    case "load": {
                        if (!msg.payload.url) {
                            throw new Error("Input has to contain payload.url");
                        }
                        let options = msg.payload.options || {};
                        if (options.autoplay === undefined) {
                            options.autoplay = true;
                        }
                        if (options.contentType === undefined) {
                            let response = await fetch(msg.payload.url, {
                                method: "HEAD"
                            });
                            options.contentType = response.headers.get("Content-Type");
                        }
                        msg.payload = await client.load(msg.payload.url, options);
                        break;
                    }
                    case "getvolume":
                        msg.payload = await client.getVolume();
                        break;
                    case "setvolume":
                        if (!msg.payload.volume) {
                            throw new Error("Input has to contain payload.volume");
                        }
                        msg.payload = await client.setVolume(msg.payload.volume);
                        break;
                    default:
                        throw new Error("unsupported action: " + msg.payload.action);
                }
                send(msg);
                done();
            } catch (err) {
                done(err);
            }
        });
    }

    RED.nodes.registerType("dlna-action", DlnaAction);

    RED.httpAdmin.get("/dlna/devices", (req, res) => {
        res.send(MediaRenderer.Renderers());
    });
};
