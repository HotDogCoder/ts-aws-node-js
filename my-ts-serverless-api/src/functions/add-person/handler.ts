import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';

import { DynamoDB } from 'aws-sdk';
import axios from 'axios';

const dynamoDb = new DynamoDB.DocumentClient();

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event: any): Promise<any> => {
  try {
    const characterId = event.body.swapi_id || '0';
    const response = await axios.get(`https://swapi.dev/api/people${characterId > '0' ? '/' + characterId : ''}`);
    const characterData = response.data;

    // Map the character data to DynamoDB attributes
    const originalName = characterData.name;
    const formattedName = originalName.toLowerCase().replace(/\s+/g, '_');
    const timestamp = new Date().getTime(); // Get current timestamp in milliseconds
    const id = `${timestamp}_${formattedName}`;

    const dynamoData = {
      id: id,
      swapi_id: characterData.id,
      name: characterData.name,
      height: characterData.height,
      mass: characterData.mass,
      hair_color: characterData.hair_color,
      skin_color: characterData.skin_color,
      eye_color: characterData.eye_color,
      birth_year: characterData.birth_year,
      gender: characterData.gender,
      homeworld: characterData.homeworld,
      films: characterData.films,
      species: characterData.species,
      vehicles: characterData.vehicles,
      starships: characterData.starships,
      swapi_created: characterData.created,
      swapi_edited: characterData.edited,
      url: characterData.url,
      created: new Date().toISOString(),
      edited: new Date().toISOString(),
      // Map other attributes as needed
    };

    // Store the data in DynamoDB
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: 'persons', // Your DynamoDB table name
      Item: dynamoData,
    };

    await dynamoDb.put(params).promise();

    // Retrieve the stored data from DynamoDB
    const retrievalParams: DynamoDB.DocumentClient.GetItemInput = {
      TableName: 'persons', // Your DynamoDB table name
      Key: { id: dynamoData.id }, // Replace 'id' with your primary key attribute
    };

    const storedData = await dynamoDb.get(retrievalParams).promise();

    return formatJSONResponse({
      statusCode: 200,
      body: { 
        message: 'Character data stored and retrieved successfully'
      }, 
      result: storedData.Item,
    });
  } catch (error) {
    return formatJSONResponse({
      statusCode: 500,
      body: { 
        message: 'Ocurrió un error al obtener los datos.',
        error: error.message || 'Error desconocido'
      },
    });
  }
};


export const main = middyfy(handler);
