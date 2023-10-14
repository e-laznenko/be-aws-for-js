import {handlerPath} from "@libs/handler-resolver";

export const getProductsList = {
    handler: `${handlerPath(__dirname)}/get-product-list.getProductsList`,
    events: [
        {
            http: {
                method: 'get',
                path: 'products',
                cors: true,
            },
        },
    ],
};

export const getProductsById = {
    handler: `${handlerPath(__dirname)}/get-product-by-id.getProductsById`,
    events: [
        {
            http: {
                method: 'get',
                path: 'products/{id}',
                cors: true,
            }
        }
    ]
}
