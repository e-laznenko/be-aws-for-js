const AWS = require('aws-sdk');
const originalGetSignedUrl = AWS.S3.prototype.getSignedUrl;
AWS.S3.prototype.getSignedUrl = jest.fn().mockReturnValue('mock-url');

const { handler } = require('./import-products-file');

describe('importProductsFile Lambda Function', () => {
    afterEach(() => {
        AWS.S3.prototype.getSignedUrl = originalGetSignedUrl;
    });

    it('should return a signed URL for given file name', async () => {
        const event = {
            queryStringParameters: {
                name: 'test.csv'
            }
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toBe('mock-url');
    });

    it('should have CORS headers', async () => {
        const event = {
            queryStringParameters: {
                name: 'test.csv'
            }
        };

        const response = await handler(event);

        expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should handle the scenario when "name" is not provided', async () => {
        const event = {
            queryStringParameters: {}
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(400);
        expect(response.body).toContain( "{\"message\":\"File name is required in the query parameter.\"}");
    });

    it('should handle errors from S3', async () => {
        AWS.S3.prototype.getSignedUrl = jest.fn().mockImplementation(() => {
            throw new Error('S3 Error');
        });

        const event = {
            queryStringParameters: {
                name: 'test.csv'
            }
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(500);
        expect(response.body).toContain( "{\"message\":\"Internal Server Error\"}");
    });
});