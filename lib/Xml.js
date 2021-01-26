const xml2js = require("xml2js");

module.exports = {
    parseString: (xml) => {
        return new Promise((resolve, reject) => {
            xml2js.parseString(xml, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }
};
