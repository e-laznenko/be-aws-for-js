import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy";
import {DynamoDB} from "aws-sdk";

const ddbClient = new DynamoDBClient({ region: "ca-central-1" });

export const getProductsById = middyfy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Incoming request for getProductsById:", event);

    const productId = event.pathParameters?.id;

    if (!productId) {
        return formatJSONResponse({
            message: "Product ID is required."
        }, 400);
    }

    try {
        const productResult = await ddbClient.send(new GetItemCommand({
            TableName: process.env.PRODUCTS_TABLE,
            Key: {
                "id": { S: productId }
            }
        }));

        if (!productResult.Item) {
            return formatJSONResponse({
                message: "Product not found."
            }, 404);
        }

        const product = DynamoDB.Converter.unmarshall(productResult.Item);


        const stockResult = await ddbClient.send(new GetItemCommand({
            TableName: process.env.STOCKS_TABLE,
            Key: {
                "product_id": { S: productId }
            }
        }));

        product.count = stockResult.Item ? parseInt(stockResult.Item.count.N, 10) : 0;

        return formatJSONResponse({
            product
        });

    } catch (error) {
        console.error("Error fetching product by ID:", error);
        return formatJSONResponse({
            message: "Internal server error."
        }, 500);
    }
});