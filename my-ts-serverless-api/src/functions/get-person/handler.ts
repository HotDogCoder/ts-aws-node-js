import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const mapeo = {
  name: 'nombre',
  height: 'altura',
  mass: 'masa',
  hair_color: 'color_cabello',
  skin_color: 'color_piel',
  eye_color: 'color_ojos',
  birth_year: 'anio_nacimiento',
  gender: 'genero',
  homeworld: 'planeta_origen',
  films: 'peliculas',
  species: 'especies',
  vehicles: 'vehiculos',
  starships: 'naves',
  created: 'fecha_creacion',
  edited: 'fecha_edicion',
  url: 'url',
};

const get_person = async (event) => {
  try {
    const characterId = event.queryStringParameters.swapi_id || ''; // Get the character ID (default to an empty string)

    let scan_params: DynamoDB.DocumentClient.ScanInput;
    let get_params: DynamoDB.DocumentClient.GetItemInput;
    let getData: DynamoDB.DocumentClient.GetItemOutput
    let scanData: DynamoDB.DocumentClient.ScanOutput;


    if (characterId != "") {
      get_params = {
        TableName: 'persons',
        Key: { id: characterId },
      };
      getData = (await dynamoDb.get(get_params).promise()) as DynamoDB.DocumentClient.GetItemOutput;
      var transformedItem = {};
      for (const key in getData.Item) {
        if (mapeo[key]) {
          transformedItem[mapeo[key]] = getData.Item[key];
        } else {
          transformedItem[key] = getData.Item[key];
        }
      }

      return formatJSONResponse({
        statusCode: 200,
        body: {
          message: 'Datos obtenidos correctamente.',
          data: transformedItem,
        }
      });
    } else {
      scan_params = {
        TableName: 'persons',
      };
      scanData = (await dynamoDb.scan(scan_params).promise()) as DynamoDB.DocumentClient.ScanOutput;
      const transformedData = scanData?.Items.map((item) => {
        const transformedItem = {};
        for (const key in item) {
          if (mapeo[key]) {
            transformedItem[mapeo[key]] = item[key];
          } else {
            transformedItem[key] = item[key];
          }
        }
        return transformedItem;
      });
      return formatJSONResponse({
        statusCode: 200,
        body: {
          message: 'Datos obtenidos correctamente.',
          data: transformedData,
        }
      });
    }

    
  } catch (error) {
    return formatJSONResponse({
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Ocurrió un error al obtener los datos.',
        error: error.message || 'Error desconocido'
      }),
    });
  }
};

export const main = middyfy(get_person);
