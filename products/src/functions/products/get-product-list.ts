import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import {APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import * as path from "path";
import * as fs from "fs";

const getProductsFromJSON = () => {
  const filePath = path.join(__dirname, 'products.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
}
export const getProductsList = middyfy(async (): Promise<APIGatewayProxyResult> => {
  const products = getProductsFromJSON();

  return formatJSONResponse(products);
})


