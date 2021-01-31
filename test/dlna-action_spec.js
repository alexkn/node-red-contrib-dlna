/// <reference types="@types/mocha" />
const helper = require("./TestHelper");
const dlnaActionNode = require("../nodes/dlna-action.js");

helper.init(require.resolve("node-red"));

describe("dlna-action Node", function () {

    afterEach(async function () {
        helper.unload();
    });

    it("should be loaded", async function () {
        var flow = [{ id: "n1", type: "dlna-action", name: "test name" }];
        await helper.load(dlnaActionNode, flow);
        var n1 = helper.getNode("n1");

        n1.should.have.property("name", "test name");
    });
});
