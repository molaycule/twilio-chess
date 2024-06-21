import path from "path";
import fs from "fs";

export default async function s3Uploader(s3, file) {
  const fileContent = fs.readFileSync(file);
  const params = {
    Bucket: "twilio-chess",
    Key: path.basename(file),
    Body: fileContent,
    ACL: "public-read"
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data.Location);
    });
  });
}
