const crypto = require("crypto");

module.exports = (ip) => {
  return crypto.createHash("sha256").update(ip).digest("hex");
};
