import type { AWS } from '@serverless/typescript';

import {getProductsById, getProductsList} from "@functions/products";

const serverlessConfiguration: AWS = {
  service: 'products',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'ca-central-1',
  },
  functions: { getProductsList, getProductsById },
  package: {
    individually: true,
    include: ['src/functions/products/products.json'],
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
  },
};

module.exports = serverlessConfiguration;
