const fs = require("fs");
const packageJson = require("../package.json");

const { version, scriptOutputName, author, description } = packageJson;

fs.writeFileSync(
  "./src/appVersion.json",
  JSON.stringify({ version, scriptOutputName, author, description }),
);
