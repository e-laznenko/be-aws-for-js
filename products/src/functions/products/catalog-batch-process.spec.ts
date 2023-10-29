import { catalogBatchProcess } from './catalog-batch-process';
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

jest.mock("@aws-sdk/client-dynamodb");
jest.mock("@aws-sdk/client-sns");
jest.mock("uuid", () => ({ v4: () => 'mock-uuid' }));

const mockedDynamoDBClient = DynamoDBClient as jest.MockedClass<typeof DynamoDBClient>;
const mockedPutItemCommand = PutItemCommand as jest.MockedClass<typeof PutItemCommand>;
const mockedSNSClient = SNSClient as jest.MockedClass<typeof SNSClient>;
const mockedPublishCommand = PublishCommand as jest.MockedClass<typeof PublishCommand>;

describe('catalogBatchProcess', () => {
    beforeEach(() => {
        process.env.PRODUCTS_TABLE = 'test-products-table';
        process.env.CREATE_PRODUCT_TOPIC_ARN = 'test-topic-arn';

        jest.clearAllMocks();
    });

    it('should process SQS events and send a notification', async () => {
        const mockEvent = {
            Records: [
                {
                    body: JSON.stringify({ 'title': 'mock-product', description: 'mock-description', price: 10 }),
                },
            ],
        };

        await catalogBatchProcess(mockEvent as any);

        expect(mockedDynamoDBClient.prototype.send).toHaveBeenCalledTimes(1);
        expect(mockedPutItemCommand).toHaveBeenCalledWith(expect.objectContaining({
            TableName: 'test-products-table',
            Item: {
                id: { S: 'mock-uuid' },
                title: { S: 'mock-product' },
                description: { S: 'mock-description' },
                price: { N: '10' },
            }
        }));

        expect(mockedSNSClient.prototype.send).toHaveBeenCalledTimes(1);
        expect(mockedPublishCommand).toHaveBeenCalledWith({
            Message: 'Product list has been successfully updated.',
            TopicArn: 'test-topic-arn',
        });
    });

    it('should handle errors when inserting into DynamoDB', async () => {
        const mockEvent = {
            Records: [
                {
                    body: JSON.stringify({ 'title': 'mock-product', description: 'mock-description', price: 10 }),
                },
            ],
        };

        // @ts-ignore
        mockedDynamoDBClient.prototype.send.mockRejectedValueOnce(new Error('DynamoDB error'));

        await catalogBatchProcess(mockEvent as any);

        expect(mockedDynamoDBClient.prototype.send).toHaveBeenCalledTimes(1);
        expect(mockedSNSClient.prototype.send).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid SQS record body', async () => {
        const mockEvent = {
            Records: [
                {
                    body: 'invalid json',
                },
            ],
        };

        await expect(() => catalogBatchProcess(mockEvent as any)).rejects.toThrow();

        expect(mockedDynamoDBClient.prototype.send).not.toHaveBeenCalled();
        expect(mockedSNSClient.prototype.send).not.toHaveBeenCalled();
    });
});
