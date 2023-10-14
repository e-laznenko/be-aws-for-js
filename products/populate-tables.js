const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const REGION = 'ca-central-1';

const dbclient = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocumentClient.from(dbclient);

//mock data from previous task
const data = [
    {
        "count": 4,
        "description": "Short Product Description1",
        "id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
        "price": 2.4,
        "title": "ProductOne"
    },
    {
        "count": 6,
        "description": "Short Product Description3",
        "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a0",
        "price": 10,
        "title": "ProductNew"
    },
    {
        "count": 7,
        "description": "Short Product Description2",
        "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a2",
        "price": 23,
        "title": "ProductTop"
    },
    {
        "count": 12,
        "description": "Short Product Description7",
        "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
        "price": 15,
        "title": "ProductTitle"
    },
    {
        "count": 7,
        "description": "Short Product Description2",
        "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
        "price": 23,
        "title": "Product"
    },
    {
        "count": 8,
        "description": "Short Product Description4",
        "id": "7567ec4b-b10c-48c5-9345-fc73348a80a1",
        "price": 15,
        "title": "ProductTest"
    },
    {
        "count": 2,
        "description": "Short Product Descriptio1",
        "id": "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
        "price": 23,
        "title": "Product2"
    },
    {
        "count": 3,
        "description": "Short Product Description7",
        "id": "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
        "price": 15,
        "title": "ProductName"
    }
];

const products = data.map(item => {
    return {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
    };
});

const stocks = data.map(item => {
    return {
        product_id: item.id,
        count: item.count,
    };
});

const populateProducts = async () => {
    for (const product of products) {
        const params = {
            TableName: 'products',
            Item: product,
        };

        await ddbDocClient.send(new PutCommand(params));
    }
};

const populateStocks = async () => {
    for (const stock of stocks) {
        const params = {
            TableName: 'stocks',
            Item: stock,
        };

        await ddbDocClient.send(new PutCommand(params));
    }
};

const run = async () => {
    await populateProducts();
    await populateStocks();
    console.log("Data populated!");
};

run().catch(error => {
    console.error("Error populating data:", error);
});