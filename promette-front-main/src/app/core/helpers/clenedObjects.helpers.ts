export const CleanObject = (obj: any, propertiesToRemove: string[]): any => {
  // Create a new object to avoid mutating the original one
  const cleanedObj = { ...obj };

  // Remove the properties
  propertiesToRemove.forEach((prop) => {
    delete cleanedObj[prop];
  });

  return cleanedObj;
};
