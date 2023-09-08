export default {
  type: "object",
  properties: {
    id: { type: 'string' },
    swapi_id: { type: 'number' },
    name: { type: 'string' },
    height: { type: 'string' },
    mass: { type: 'string' },
    hair_color: { type: 'string' },
    skin_color: { type: 'string' },
    eye_color: { type: 'string' },
    birth_year: { type: 'string' },
    gender: { type: 'string' },
    homeworld: { type: 'string' },
    films: { type: 'array' },
    species: { type: 'array' },
    vehicles: { type: 'array' },
    starships: { type: 'array' },
    swapi_created: { type: 'string' },
    swapi_edited: { type: 'string' },
    created: { type: 'string' },
    edited: { type: 'string' },
    url: { type: 'string' },
  },
  required: ['swapi_id']
} as const;