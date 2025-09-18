export const getBirthDateFromCURP = (curp: string) => {
  // Verificar si el CURP tiene el formato correcto
  const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]{2}$/;
  if (!curpRegex.test(curp)) {
    return 'CURP no válida';
  }

  // Extraer la fecha de nacimiento del CURP
  const year = parseInt(curp.substring(4, 6), 10);
  const month = parseInt(curp.substring(6, 8), 10);
  const day = parseInt(curp.substring(8, 10), 10);

  // Determinar el siglo según el año
  const currentYear = new Date().getFullYear() % 100;
  const fullYear = year > currentYear ? 1900 + year : 2000 + year;

  // Formatear la fecha
  const birthDate = new Date(fullYear, month - 1, day);

  // Verificar si la fecha es válida
  if (isNaN(birthDate.getTime())) {
    return 'Fecha de nacimiento no válida';
  }

  return birthDate.toLocaleDateString('es-MX');
};

export const getGenderFromCURP = (curp: string) => {
  // Verificar si el CURP tiene el formato correcto
  const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]{2}$/;
  if (!curpRegex.test(curp)) {
    return 'CURP no válida';
  }

  // Extraer el género (posición 11)
  const genderChar = curp.charAt(10);

  // Determinar el género
  if (genderChar === 'H') {
    return 'Hombre';
  } else if (genderChar === 'M') {
    return 'Mujer';
  } else {
    return 'Género no reconocido';
  }
};
