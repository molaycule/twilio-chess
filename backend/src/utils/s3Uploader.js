import AWS from "aws-sdk";
import path from "path";
import fs from "fs";
import generateRandomHash from "./generateRandomHash.js";

export default async function s3Uploader(bucketName, file) {
  try {
    const s3 = new AWS.S3();
    const fileContent = fs.readFileSync(file);
    const [fileName, fileExt] = path.basename(file).split(".");
    const params = {
      Bucket: bucketName,
      Key: `${fileName}-${generateRandomHash()}.${fileExt}`,
      Body: fileContent,
      ACL: "public-read"
    };
    const data = await s3.upload(params).promise();
    if (!data) {
      throw new Error("Failed to upload file");
    } else {
      return data.Location;
    }
  } catch (err) {
    throw err;
  }
}
