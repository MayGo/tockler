const flattenMessages = (nestedMessages: any, prefix = '') =>
  Object.keys(nestedMessages).reduce((messages, key) => {
    const value = nestedMessages[key];
    const prefixedKey =
      prefix && prefix !== 'default' ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      messages[prefixedKey] = value;
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey));
    }

    return messages;
  }, {});

export const getMessages = (locale: TSupportedLangs) =>
  flattenMessages(require(`../locales/${locale}`));
