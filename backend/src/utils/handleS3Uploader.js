import constants from "../constants/index.js";
import createS3BucketIfNotExists from "./createS3BucketIfNotExists.js";
import getGeneratedChessboardDirectory from "./getGeneratedChessboardDirectory.js";
import s3Uploader from "./s3Uploader.js";
import fs from "fs";

export default async function handleS3Uploader(fileName, sessionId) {
  const dir = getGeneratedChessboardDirectory();
  if (fs.existsSync(dir)) {
    const file = `${dir}/${fileName}.png`;
    const bucketName = `${constants.s3BucketNamePrefix}-${sessionId}`;
    const createStatus = await createS3BucketIfNotExists(bucketName);
    if (!createStatus) {
      throw new Error("Failed to create S3 bucket");
    }

    return await s3Uploader(bucketName, file);
  }
}
