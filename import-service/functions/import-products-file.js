const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET = 'upload-aws-js';

module.exports.handler = async (event) => {
    const fileName = event.queryStringParameters.name;

    if (!fileName) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'File name is required in the query parameter.' }),
        };
    }

    const params = {
        Bucket: BUCKET,
        Key: `uploaded/${fileName}`,
        Expires: 60 * 5,
        ContentType: 'text/csv'
    };

    try {
        const signedUrl = s3.getSignedUrl('putObject', params);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(signedUrl),
        };
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};