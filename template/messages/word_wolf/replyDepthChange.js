const parts = require("../constants/messageParts");
const wordWolfParts = require("./constants/messageParts");

exports.main = async () => {
    return [
        {
          "type": "flex",
          "altText": "ワードの難易度",
          "contents": wordWolfParts.depthOptions
        }
      ]
}