import { getProductsList } from './get-product-list';
import { formatJSONResponse } from '@libs/api-gateway';
import * as fs from 'fs';

// Mocking the required modules
jest.mock('fs');
jest.mock('@libs/api-gateway');
jest.mock('@libs/lambda', () => ({
    middyfy: jest.fn((handler) => handler)
}));

describe('getProductsList', () => {
    const MOCK_PRODUCTS = [
        { id: '1', name: 'Product A' },
        { id: '2', name: 'Product B' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(MOCK_PRODUCTS));

        (formatJSONResponse as jest.Mock).mockImplementation((response) => response);
    });

    it('should fetch products from the JSON file and return them', async () => {
        const mockEvent = {};
        const mockContext = {
            functionName: 'getProductsList'
        };

        // @ts-ignore
        const response = await getProductsList(mockEvent, mockContext);

        expect(fs.readFileSync).toBeCalled();
        expect(formatJSONResponse).toBeCalledWith(MOCK_PRODUCTS);
        expect(response).toEqual(MOCK_PRODUCTS);
    });
});