import { SQSEvent } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { formatJSONResponse } from "@libs/api-gateway";
import * as console from "console";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "ca-central-1" });
const dynamoDb =  new DynamoDBClient({ region: "ca-central-1" });

const insertProduct = async (title: string, description: string, price: number) => {
    const productId = uuidv4();

    try {
        await dynamoDb.send(new PutItemCommand({
            TableName: process.env.PRODUCTS_TABLE,
            Item: {
                "id": { S: productId },
                "title": { S: title },
                "description": { S: description },
                "price": { N: price.toString() }
            }
        }));

    } catch (error) {
        console.error("Error creating product:", error);
        return formatJSONResponse({
            message: "Internal server error from lambda"
        }, 500);
    }
};

const cleanKeys = obj => {
    const result = {};
    for (let key in obj) {
        const cleanKey = key.replace(/^\ufeff/, '');
        result[cleanKey] = obj[key];
    }
    return result;
};

export const catalogBatchProcess = async (event: SQSEvent): Promise<void> => {
    console.log('SQS event:', event);

    for (const record of event.Records) {
        const body = cleanKeys(JSON.parse(record.body));
        // @ts-ignore
        const { title, description, price } = body;

        try {
            await insertProduct(title, description, price);
        } catch (error) {
            console.error('Error creating product:', error);
        }
    }

    const message = `Product list has been successfully updated.`;
    const params = {
        Message: message,
        TopicArn: process.env.CREATE_PRODUCT_TOPIC_ARN
    };

    await snsClient.send(new PublishCommand(params));
};

