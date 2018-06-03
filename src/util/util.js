class Storage {
  constructor(storageArea) {
    ['get', 'set'].forEach(name => {
      this[name] = function promisified(firstArg) {
        return new Promise((resolve, reject) => {
          storageArea[name](firstArg, result => {
            const { lastError } = chrome.runtime;

            if (lastError) {
              reject(lastError);
            } else {
              resolve(result);
            }
          });
        });
      };
    });
  }
}

// Promisify local storage
export const storage = new Storage(chrome.storage.local);

export function capitalize(string) {
  const input = String(string);

  return `${input[0].toUpperCase()}${input.slice(1)}`;
}

export function similarDomains(noWWW, possiblyWWW) {
  return [noWWW, `www.${noWWW}`].includes(possiblyWWW);
}
