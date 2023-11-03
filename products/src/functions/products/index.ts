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
};

export const createProduct = {
    handler: `${handlerPath(__dirname)}/create-product.createProduct`,
    events: [
        {
            http: {
                method: 'post',
                path: 'products',
                cors: true,
            }
        }
    ]
};

export const catalogBatchProcess = {
    handler: `${handlerPath(__dirname)}/catalog-batch-process.catalogBatchProcess`,
    events: [
        {
            sqs: {
                batchSize: 5,
                arn: {
                    'Fn::GetAtt': ['CatalogItemsQueue', 'Arn']
                }
            }
        }
    ]
};


