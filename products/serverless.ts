import type { AWS } from '@serverless/typescript';

import {catalogBatchProcess, createProduct, getProductsById, getProductsList} from "@functions/products";

const serverlessConfiguration: AWS = {
  service: 'products',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-dynamodb-local', 'serverless-offline'],
  resources: {
    Resources: {
      CatalogItemsQueue: {
        Type: "AWS::SQS::Queue"
      },
      CreateProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          DisplayName: 'Create Product Notification',
          TopicName: 'createProductTopic'
        }
      },
      EmailSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'email',
          Endpoint: 'kate.laznenko@gmail.com',
          TopicArn: {
            Ref: 'CreateProductTopic'
          }
        }
      }
    }
  },
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'ca-central-1',
    environment: {
      PRODUCTS_TABLE: 'products',
      STOCKS_TABLE: 'stocks',
      CREATE_PRODUCT_TOPIC_ARN: { Ref: 'CreateProductTopic' }
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [
          'dynamodb:Scan',
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
        ],
        Resource: [
          "arn:aws:dynamodb:${opt:region, self:provider.region}:${aws:accountId}:table/products",
          "arn:aws:dynamodb:${opt:region, self:provider.region}:${aws:accountId}:table/products/*",
          "arn:aws:dynamodb:${opt:region, self:provider.region}:${aws:accountId}:table/stocks",
          "arn:aws:dynamodb:${opt:region, self:provider.region}:${aws:accountId}:table/stocks/*",
        ]
      },
      {
        Effect: 'Allow',
        Action: [
          'sqs:ReceiveMessage',
          'sqs:DeleteMessage',
          'sqs:GetQueueAttributes'
        ],
        Resource: {
          'Fn::GetAtt': ['CatalogItemsQueue', 'Arn']
        }
      },
      {
        Effect: 'Allow',
        Action: 'sns:Publish',
        Resource: {
          Ref: 'CreateProductTopic'
        }
      }
    ]
  },
  functions: { getProductsList, getProductsById, createProduct, catalogBatchProcess },
  package: {
    individually: true,
    patterns: ['src/functions/products/products.json'],
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    'serverless-offline': {
      httpPort: 3000
    },
    dynamodb: {
      stages: ['dev'],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
      }
    }
  }
};

module.exports = serverlessConfiguration;
