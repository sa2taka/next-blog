const contentful = require('contentful');

const config = {
  mainAuthorId: process.env.CTF_MAIN_AUTHOR_ID,
  space: process.env.CTF_SPACE_ID,
  accessToken: process.env.CTF_CDA_ACCESS_TOKEN,
};

export const createClient = (): any => {
  return contentful.createClient(config);
};
