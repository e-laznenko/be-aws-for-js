import { getProductsById } from './get-product-by-id';
import * as fs from 'fs';

jest.mock('fs');
jest.mock('@libs/lambda', () => ({
    middyfy: jest.fn((handler) => handler)
}));

describe('getProductsById', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a product when a valid ID is provided', async () => {
        (fs.readFileSync as jest.Mock).mockReturnValueOnce(JSON.stringify([{ id: '2', name: 'Test Product' }]));

        const mockEvent = {
            pathParameters: { id: '2' },
        };
        const mockContext = {
            functionName: 'getProductsById'
        };

        // @ts-ignore
        const response = await getProductsById(mockEvent, mockContext);
        const responseBody = JSON.parse(response.body);

        expect(response.statusCode).toEqual(200);
        expect(responseBody.product).toBeDefined();
        expect(responseBody.product.name).toEqual('Test Product');
    });

    it('should return a 404 when the product is not found', async () => {
        (fs.readFileSync as jest.Mock).mockReturnValueOnce(JSON.stringify([])); // Mock an empty product list

        const mockEvent = {
            pathParameters: { id: 'non_existent_id' },
        };
        const mockContext = {
            functionName: 'getProductsById'
        };

        // @ts-ignore
        const response = await getProductsById(mockEvent, mockContext);

        expect(response.statusCode).toEqual(404);
        expect(response.body).toContain('Product not found');
    });

    it('should return a 400 when no product ID is provided', async () => {
        const mockEvent = {
            pathParameters: null
        };
        const mockContext = {
            functionName: 'getProductsById',
        };

        // @ts-ignore
        const response = await getProductsById(mockEvent, mockContext);

        expect(response.statusCode).toEqual(400);
        expect(response.body).toContain('Product ID is required');
    });
});