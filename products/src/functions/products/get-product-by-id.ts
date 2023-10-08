import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy";
import * as fs from 'fs';
import * as path from 'path';

const getProductsFromJSON = (): any[] => {
    const filePath = path.join(__dirname, 'products.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
}

const getProductById = (id: string) => {
    const products = getProductsFromJSON();
    return products.find(product => product.id === id);
}

export const getProductsById = middyfy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const productId = event.pathParameters?.id;

    if (!productId) {
        return formatJSONResponse({
            message: "Product ID is required."
        }, 400);
    }

    const product = getProductById(productId);

    if (!product) {
        return formatJSONResponse({
            message: "Product not found."
        }, 404);
    }

    return formatJSONResponse({
        product
    });
});