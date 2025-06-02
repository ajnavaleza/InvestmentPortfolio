// Data Cleaning Utilities for Firebase Compatibility

/**
 * Clean undefined values from object to prevent Firestore errors
 */
export function cleanUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefinedValues(item));
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (value !== undefined) {
          if (value === null) {
            cleaned[key] = null;
          } else if (Array.isArray(value)) {
            cleaned[key] = value.map(item => cleanUndefinedValues(item));
          } else if (typeof value === 'object') {
            cleaned[key] = cleanUndefinedValues(value);
          } else {
            cleaned[key] = value;
          }
        }
      }
    }
    return cleaned;
  }

  return obj;
}

/**
 * Generate a reliable numeric ID from Firebase document ID
 */
export function generatePortfolioId(firebaseId: string): number {
  let hash = 0;
  for (let i = 0; i < firebaseId.length; i++) {
    const char = firebaseId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Clean portfolio data for Firebase updates
 */
export function cleanPortfolioData(portfolio: any): any {
  const clean: any = {};
  
  for (const key in portfolio) {
    if (portfolio.hasOwnProperty(key)) {
      const value = portfolio[key];
      
      if (value !== undefined) {
        if (value === null) {
          clean[key] = null;
        } else if (Array.isArray(value)) {
          clean[key] = value.map((item: any) => {
            if (typeof item === 'object' && item !== null) {
              const cleanItem: any = {};
              for (const itemKey in item) {
                if (item.hasOwnProperty(itemKey) && item[itemKey] !== undefined) {
                  cleanItem[itemKey] = item[itemKey];
                }
              }
              return cleanItem;
            }
            return item;
          });
        } else if (typeof value === 'object' && value !== null) {
          const cleanObj: any = {};
          for (const objKey in value) {
            if (value.hasOwnProperty(objKey) && value[objKey] !== undefined) {
              cleanObj[objKey] = value[objKey];
            }
          }
          clean[key] = cleanObj;
        } else {
          clean[key] = value;
        }
      }
    }
  }
  
  return clean;
} 