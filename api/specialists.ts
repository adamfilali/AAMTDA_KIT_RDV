import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vos vraies données de production AMTDA
const specialistsData = [
  { "id": "sp-1", "name": "Dr. Amina Bennani", "specialties": ["Orthophonie"], "bio": "Orthophoniste clinicienne (12 ans d'expérience).", "avatar": "female_doc_1", "guichetId": "1" },
  { "id": "sp-2", "name": "M. Youssef El Amrani", "specialties": ["Psychomotricité"], "bio": "Thérapeute en psychomotricité.", "avatar": "male_doc_1", "guichetId": "2" },
  { "id": "sp-3", "name": "Dr. Sofia Alami", "specialties": ["Neuropsychologie"], "bio": "Docteur en Neuropsychologie cognitive.", "avatar": "female_doc_2", "guichetId": "3" },
  { "id": "sp-4", "name": "Mme Leila Meziane", "specialties": ["Psychologie clinique"], "bio": "Psychologue clinicienne enfants/adolescents.", "avatar": "female_doc_3", "guichetId": "4" },
  { "id": "sp-5", "name": "M. Karim Tazi", "specialties": ["Ergothérapie"], "bio": "Ergothérapeute diplômé d'État.", "avatar": "male_doc_2", "guichetId": "5" },
  { "id": "sp-6", "name": "Mme Fatima-Zahra Alaoui", "specialties": ["Orthoptie"], "bio": "Orthoptiste spécialisée.", "avatar": "female_doc_4", "guichetId": "6" }
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Autorise les requêtes propres de l'application
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'GET') {
    return res.status(200).json(specialistsData);
  }
  return res.status(405).end();
}
