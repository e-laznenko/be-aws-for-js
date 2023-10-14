import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { v4 as uuidv4 } from 'uuid';

const ddbClient = new DynamoDBClient({ region: "ca-central-1" });

export const createProduct = middyfy(async (event) => {
    // Logging incoming request for createProduct
    console.log("Incoming request for createProduct:", event);

    const { title, description, price } = event.body;

    if (!title || !description || typeof price !== 'number') {
        // POST /products lambda functions returns error 400 status code if product data is invalid
        return formatJSONResponse({
            message: "Invalid input data."
        }, 400);
    }

    const productId = uuidv4();

    try {
        await ddbClient.send(new PutItemCommand({
            TableName: process.env.PRODUCTS_TABLE,
            Item: {
                "id": { S: productId },
                "title": { S: title },
                "description": { S: description },
                "price": { N: price.toString() }
            }
        }));

        return formatJSONResponse({
            message: "Product created successfully.",
            productId: productId
        });

    } catch (error) {
        console.error("Error creating product:", error);
        return formatJSONResponse({
            message: "Internal server error from lambda"
        }, 500);
    }
});