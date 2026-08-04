// Los labels visibles se resuelven desde el diccionario de idioma
// (t.specialities[value]); acá solo viven los valores del backend.
export const SPECIALITY_VALUES = [
  'Clinical',
  'Guard',
  'Surgery',
  'Dermatology',
  'Cardiology',
  'Traumatology',
];

export const SPECIALITIES = SPECIALITY_VALUES.map((value) => ({ value }));
