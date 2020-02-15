const MediaRendererClient = require("upnp-mediarenderer-client");

module.exports = function(RED) {
    function DlnaAction(config) {
        RED.nodes.createNode(this,config);

        this.deviceUrl = config.deviceUrl;

        this.on("input", (msg, send, done) => {
            let client = new MediaRendererClient(msg.deviceUrl || this.deviceUrl);

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
};
