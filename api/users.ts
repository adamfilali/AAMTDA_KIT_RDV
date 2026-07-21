import type { VercelRequest, VercelResponse } from '@vercel/node';

const usersData = [
  {"id": "u-admin", "username": "admin", "passwordHash": "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", "role": "ADMIN", "name": "Direction AMTDA Maroc"},
  {"id": "u-sec", "username": "secretaire", "passwordHash": "ee63c6506c68d4613b9553820393f22db66a1dbc9ba6dc5640df9fce741e6258", "role": "SECRETAIRE", "name": "Siham El Fassi"},
  {"id": "u-ben", "username": "amina", "passwordHash": "c108533d4511b3e7263207ace80f6b4be9dd983898514f1dbc075c9b6a83bae1", "role": "SPECIALISTE", "name": "Dr. Amina Bennani"}
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    return res.status(200).json(usersData);
  }
  return res.status(405).end();
}
