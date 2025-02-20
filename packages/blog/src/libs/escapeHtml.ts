export const escapeHtml = (str: string) => {
  if (typeof str !== 'string') {
    return str;
  }
  return str.replace(
    /[&'`"<>]/g,
    (match) =>
      // @ts-ignore
      ({
        '&': '&amp;',
        "'": '&#x27;',
        '`': '&#x60;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;',
      })[match] || ''
  );
};
