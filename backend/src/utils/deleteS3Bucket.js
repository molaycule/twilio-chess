import AWS from "aws-sdk";
import emptyS3Bucket from "./emptyS3Bucket.js";
import constants from "../constants/index.js";

export default async function deleteS3Bucket(sessionId) {
  try {
    const s3 = new AWS.S3();
    const bucketName = `${constants.s3BucketNamePrefix}-${sessionId}`;
    await emptyS3Bucket(s3, bucketName);
    await s3.deleteBucket({ Bucket: bucketName }).promise();
    console.log(`Bucket ${bucketName} deleted successfully`);
  } catch (error) {
    console.error("Error deleting bucket:", error);
  }
}
