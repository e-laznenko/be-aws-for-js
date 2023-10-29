const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const csvParser = require('csv-parser');
const { Readable } = require('stream');

module.exports.handler = async (event) => {
    for (const record of event.Records) {
        const bucketName = record.s3.bucket.name;
        const sourceKey = record.s3.object.key;

        const s3Stream = s3.getObject({
            Bucket: bucketName,
            Key: sourceKey
        }).createReadStream();

        await new Promise((resolve, reject) => {
            s3Stream
                .pipe(csvParser())
                .on('data', (data) => {
                    console.log(data);
                })
                .on('end', resolve)
                .on('error', reject);
        });

        const targetKey = sourceKey.replace('uploaded/', 'parsed/');


        await s3.copyObject({
            Bucket: bucketName,
            CopySource: `${bucketName}/${sourceKey}`,
            Key: targetKey,
        }).promise();


        await s3.deleteObject({
            Bucket: bucketName,
            Key: sourceKey,
        }).promise();
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Processing complete' }),
    };
};