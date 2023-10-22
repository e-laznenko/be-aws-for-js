import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import {APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: "ca-central-1" });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const getProductsList = middyfy(async (event): Promise<APIGatewayProxyResult> => {
  console.log("Incoming request for getProductsList:", event);

  try {
    const productsResponse = await docClient.send(
        new ScanCommand({ TableName: process.env.PRODUCTS_TABLE })
    );

    const stocksResponse = await docClient.send(
        new ScanCommand({ TableName: process.env.STOCKS_TABLE })
    );

    const productsWithStocks = productsResponse.Items.map(product => {
      const stock = stocksResponse.Items.find(item => item.product_id === product.id);
      return {
        ...product,
        count: stock?.count || 0
      };
    });

    return formatJSONResponse(productsWithStocks as unknown as Record<string, unknown>);
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error fetching products", error: error.message })
    };
  }
});