
// Helper function to safely convert Firestore timestamp to Date
export const safelyConvertToDate = (dateField: any): Date => {
  if (dateField instanceof Date) {
    return dateField;
  }
  // Check if it's a Firestore timestamp (has toDate method)
  if (dateField && typeof dateField === 'object' && 'toDate' in dateField) {
    return dateField.toDate();
  }
  // If it's a string or timestamp number, convert to Date
  if (dateField) {
    return new Date(dateField);
  }
  // Default to current date if all else fails
  return new Date();
};
