const https = require('https');
const fs = require('fs');

const queryURL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+*+from+pscomppars&format=csv";
const dest = "./output.csv";

function download(url, dest) {
  return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest, { flags: "wx" });

      const request = https.get(url, response => {
          if (response.statusCode === 200) {
              response.pipe(file);
          } else {
              file.close();
              fs.unlink(dest, () => {}); // Make sure to delete the temp file if something goes wrong.
              reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
          }
      });

      request.on("error", err => {
          file.close();
          fs.unlink(dest, () => {}); // Delete temp file on error.
          reject(err.message);
      });

      file.on("finish", () => {
          resolve();
      });

      file.on("error", err => {
          file.close();

          if (err.code === "EEXIST") {
              reject("File already exists");
          } else {
              fs.unlink(dest, () => {}); // Delete temp file on error.
              reject(err.message);
          }
      });
  });
};

download(queryURL,dest);