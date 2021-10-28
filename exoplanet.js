// This is the template for downloading the exoplanet data.
// When my teammates complete their api, I will include a third optional parameter to download their data to csv.
// This will allow me to pull their data to incorporate into my project.
// This will read as the function signature '(url, dest, flag)'.

const https = require('https');
const fs = require('fs');

const queryURL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+*+from+pscomppars&format=csv";
const destination = "./output.csv";

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

download(queryURL,destination);