import type { AWS } from '@serverless/typescript';

import {createProduct, getProductsById, getProductsList} from "@functions/products";

const serverlessConfiguration: AWS = {
  service: 'products',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-dynamodb-local', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'ca-central-1',
    environment: {
      PRODUCTS_TABLE: 'products',
      STOCKS_TABLE: 'stocks'
    },

  },
  functions: { getProductsList, getProductsById, createProduct },
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
