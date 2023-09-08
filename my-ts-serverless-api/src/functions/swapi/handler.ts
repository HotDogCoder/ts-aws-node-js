import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import axios from 'axios';

const mapeo = {
  name: 'nombre',
  height: 'altura',
  mass: 'masa',
  hair_color: 'color_cabello',
  skin_color: 'color_piel',  // Map "skin_color" to "color_piel"
  eye_color: 'color_ojos',   // Map "eye_color" to "color_ojos"
  birth_year: 'anio_nacimiento',  // Map "birth_year" to "anio_nacimiento"
  gender: 'genero',          // Map "gender" to "genero"
  homeworld: 'planeta_origen',  // Map "homeworld" to "planeta_origen"
  films: 'peliculas',        // Map "films" to "peliculas"
  species: 'especies',       // Map "species" to "especies"
  vehicles: 'vehiculos',     // Map "vehicles" to "vehiculos"
  starships: 'naves',        // Map "starships" to "naves"
  created: 'fecha_creacion', // Map "created" to "fecha_creacion"
  edited: 'fecha_edicion',   // Map "edited" to "fecha_edicion"
  url: 'url'                 // Map "url" to "url"
};

const swapi = async (event) => {
  try {
    const characterId = event.queryStringParameters.id || '0'; // Get the character ID (default to 0)
    const response = await axios.get(`https://swapi.dev/api/people${characterId > '0' ? '/'+characterId: ''}`);
    const characterData = response.data;
    const { results } = characterData

    var result_response: any[] = []

    if (results) {
      results.forEach((character) => {
        // Transform the data into Spanish
        for (const key in character) {
          if (mapeo[key]) {
            character[mapeo[key]] = character[key];
            delete character[key];
          }
        }

        result_response.push(character)
      });

      return formatJSONResponse({
        statusCode: 200,
        body: result_response,
      });
    } else {
      // Transform the data into Spanish
      const characterEnEspanol = {};
      for (const key in characterData) {
        if (mapeo[key]) {
          characterEnEspanol[mapeo[key]] = characterData[key];
        } else {
          characterEnEspanol[key] = characterData[key];
        }
      }

      return formatJSONResponse({
        statusCode: 200,
        body: characterEnEspanol,
      });
    }

  } catch (error) {
    return formatJSONResponse({
      statusCode: 500,
      body: JSON.stringify({ error: 'Ocurrió un error al obtener los datos.' }),
    });
  }
};

export const main = middyfy(swapi);
