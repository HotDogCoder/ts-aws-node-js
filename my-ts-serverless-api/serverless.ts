import type { AWS } from '@serverless/typescript';

import hello from '@functions/hello';
import swapi from '@functions/swapi';
import get_person from '@functions/get-person';
import add_person from '@functions/add-person';

const serverlessConfiguration: AWS = {
  service: 'my-ts-serverless-api',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iamRoleStatements: [ // Add IAM role statements here
      {
        Effect: 'Allow',
        Action: ['dynamodb:PutItem','dynamodb:GetItem','dynamodb:Scan'],
        Resource: { 'Fn::GetAtt': ['PersonsTable', 'Arn'] }, // Use Fn::GetAtt to get the DynamoDB table's ARN
      },
    ],
  },
  // import the function via paths
  functions: { hello, swapi, add_person, get_person },
  package: { individually: true },
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
  resources: {
    Resources: {
      PersonsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'persons', // Specify the table name
          AttributeDefinitions: [
            {
              AttributeName: 'id', // Define your primary key attribute
              AttributeType: 'S', // Number type
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id', // Specify the primary key attribute(s)
              KeyType: 'HASH', // HASH for a simple primary key
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5, // Adjust based on your read capacity needs
            WriteCapacityUnits: 5, // Adjust based on your write capacity needs
          },
        },
      },
    },
  }
  
};


module.exports = serverlessConfiguration;
