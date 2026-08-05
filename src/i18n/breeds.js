/**
 * Traducción de nombres de raza al español.
 *
 * Las razas vienen crudas en inglés desde TheDogAPI/TheCatAPI (ver
 * breedsApi.list en api/endpoints.js) y no hay ninguna fuente de datos en
 * español integrada, así que mapeamos a mano las más comunes. El valor real
 * que se guarda y se envía al backend sigue siendo siempre el string en
 * inglés que devuelve la API — esto es solo para mostrar en pantalla.
 *
 * Si una raza no está en el diccionario, se muestra tal cual vino (fallback).
 */

const BREED_TRANSLATIONS_ES = {
  'Mixed Breed': 'Mestizo',

  // ---------- perros (TheDogAPI) ----------
  'Labrador Retriever': 'Labrador Retriever',
  'Golden Retriever': 'Golden Retriever',
  'German Shepherd Dog': 'Pastor Alemán',
  'French Bulldog': 'Bulldog Francés',
  Bulldog: 'Bulldog',
  Poodle: 'Caniche',
  'Poodle (Standard)': 'Caniche Estándar',
  'Poodle (Miniature)': 'Caniche Miniatura',
  'Poodle (Toy)': 'Caniche Toy',
  Beagle: 'Beagle',
  Rottweiler: 'Rottweiler',
  'Yorkshire Terrier': 'Yorkshire Terrier',
  Boxer: 'Bóxer',
  Dachshund: 'Salchicha (Dachshund)',
  'Siberian Husky': 'Husky Siberiano',
  'Great Dane': 'Gran Danés',
  Chihuahua: 'Chihuahua',
  Pug: 'Pug',
  'Shih Tzu': 'Shih Tzu',
  'Border Collie': 'Border Collie',
  'Australian Shepherd': 'Pastor Australiano',
  Boxer_: 'Bóxer',
  Cocker_Spaniel: 'Cocker Spaniel',
  'Cocker Spaniel': 'Cocker Spaniel',
  Dalmatian: 'Dálmata',
  'Doberman Pinscher': 'Dóberman',
  'Shetland Sheepdog': 'Pastor de Shetland',
  Pomeranian: 'Pomerania',
  Maltese: 'Maltés',
  Basset: 'Basset Hound',
  'Basset Hound': 'Basset Hound',
  Bloodhound: 'Sabueso (Bloodhound)',
  'Saint Bernard': 'San Bernardo',
  Newfoundland: 'Terranova',
  Akita: 'Akita',
  'Alaskan Malamute': 'Malamute de Alaska',
  Weimaraner: 'Weimaraner',
  'American Bulldog': 'Bulldog Americano',
  'American Pit Bull Terrier': 'Pit Bull Terrier Americano',
  'Cavalier King Charles Spaniel': 'Cavalier King Charles Spaniel',
  'Miniature Schnauzer': 'Schnauzer Miniatura',
  Schnauzer: 'Schnauzer',
  'Jack Russell Terrier': 'Jack Russell Terrier',
  'West Highland White Terrier': 'West Highland White Terrier',

  // ---------- gatos (TheCatAPI) ----------
  'Domestic Short Hair': 'Doméstico de Pelo Corto',
  'Domestic Long Hair': 'Doméstico de Pelo Largo',
  'Domestic Medium Hair': 'Doméstico de Pelo Medio',
  'Maine Coon': 'Maine Coon',
  Persian: 'Persa',
  Siamese: 'Siamés',
  'British Shorthair': 'Británico de Pelo Corto',
  'Scottish Fold': 'Scottish Fold',
  Sphynx: 'Sphynx',
  Bengal: 'Bengalí',
  Ragdoll: 'Ragdoll',
  Abyssinian: 'Abisinio',
  Birman: 'Birmano',
  Burmese: 'Birmano de Birmania',
  'Russian Blue': 'Azul Ruso',
  'Norwegian Forest Cat': 'Bosque de Noruega',
  'American Shorthair': 'Americano de Pelo Corto',
  Himalayan: 'Himalayo',
  'Devon Rex': 'Devon Rex',
  'Cornish Rex': 'Cornish Rex',
  Manx: 'Manx',
  Turkish: 'Angora Turco',
  'Turkish Angora': 'Angora Turco',
  'Turkish Van': 'Van Turco',
  Munchkin: 'Munchkin',
  Savannah: 'Savannah',
  Egyptian: 'Mau Egipcio',
  'Egyptian Mau': 'Mau Egipcio',
};

export function translateBreed(breed) {
  if (!breed) return breed;
  return BREED_TRANSLATIONS_ES[breed] ?? breed;
}
