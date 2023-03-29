// sees if the server is dev or prod
const dev = process.env.NODE_ENV !== 'production';
export const server = dev ? 'http://localhost:3000' : 'https://place.loq.no';


