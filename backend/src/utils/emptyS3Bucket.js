export default async function emptyS3Bucket(s3, bucketName) {
  const listParams = {
    Bucket: bucketName
  };

  const deleteParams = {
    Bucket: bucketName,
    Delete: { Objects: [] }
  };

  try {
    const listedObjects = await s3.listObjectsV2(listParams).promise();
    if (listedObjects.Contents.length === 0) return;

    listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
    });

    await s3.deleteObjects(deleteParams).promise();
    if (listedObjects.IsTruncated) {
      await emptyS3Bucket(bucketName);
    }
  } catch (error) {
    console.error("Error emptying bucket:", error);
  }
}
