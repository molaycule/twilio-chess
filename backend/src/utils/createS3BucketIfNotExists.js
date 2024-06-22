import AWS from "aws-sdk";

export default async function createS3BucketIfNotExists(bucketName) {
  const s3 = new AWS.S3();

  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    return true;
  } catch (error) {
    if (error.statusCode === 404) {
      try {
        await s3.createBucket({ Bucket: bucketName }).promise();
        console.log(`Bucket ${bucketName} created successfully`);

        // Disable block public access
        await s3
          .putPublicAccessBlock({
            Bucket: bucketName,
            PublicAccessBlockConfiguration: {
              BlockPublicAcls: false,
              IgnorePublicAcls: false,
              BlockPublicPolicy: false,
              RestrictPublicBuckets: false
            }
          })
          .promise();

        // Set object ownership to 'BucketOwnerPreferred'
        await s3
          .putBucketOwnershipControls({
            Bucket: bucketName,
            OwnershipControls: {
              Rules: [
                {
                  ObjectOwnership: "BucketOwnerPreferred"
                }
              ]
            }
          })
          .promise();

        // Set bucket ACL to public-read-write
        await s3
          .putBucketAcl({
            Bucket: bucketName,
            ACL: "public-read-write"
          })
          .promise();
        return true;
      } catch (createError) {
        console.error("Error creating bucket:", createError);
        return false;
      }
    } else {
      console.error("Error checking bucket:", error);
      return false;
    }
  }
}
