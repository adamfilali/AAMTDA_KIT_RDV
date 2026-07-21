import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Script de secours AMTDA pour la démonstration
if (typeof window !== 'undefined') {
  const fullDb = {
    "users": [
      {"id": "u-admin", "username": "admin", "passwordHash": "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", "role": "ADMIN", "name": "Direction AMTDA Maroc"},
      {"id": "u-sec", "username": "secretaire", "passwordHash": "ee63c6506c68d4613b9553820393f22db66a1dbc9ba6dc5640df9fce741e6258", "role": "SECRETAIRE", "name": "Siham El Fassi"},
      {"id": "u-ben", "username": "amina", "passwordHash": "c108533d4511b3e7263207ace80f6b4be9dd983898514f1dbc075c9b6a83bae1", "role": "SPECIALISTE", "name": "Dr. Amina Bennani"},
      {"id": "u-amr", "username": "youssef", "passwordHash": "c108533d4511b3e7263207ace80f6b4be9dd983898514f1dbc075c9b6a83bae1", "role": "SPECIALISTE", "name": "M. Youssef El Amrani"},
      {"id": "u-ala", "username": "sofia", "passwordHash": "c108533d4511b3e7263207ace80f6b4be9dd983898514f1dbc075c9b6a83bae1", "role": "SPECIALISTE", "name": "Dr. Sofia Alami"},
      {"id": "u-mez", "username": "leila", "passwordHash": "c108533d4511b3e7263207ace80f6b4be9dd983898514f1dbc075c9b6a83bae1", "role": "SPECIALISTE", "name": "Mme Leila Meziane"},
      {"id": "u-taz", "username": "karim", "passwordHash": "c108533d4511b3e7263207ace80f6b4be9dd983898514f1dbc075c9b6a83bae1", "role": "SPECIALISTE", "name": "M. Karim Tazi"},
      {"id": "u-aoi", "username": "fatima", "passwordHash": "c108533d4511b3e7263207ace80f6b4be9dd983898514f1dbc075c9b6a83bae1", "role": "SPECIALISTE", "name": "Mme Fatima-Zahra Alaoui"}
    ],
    "specialists": [
      {"id": "sp-1", "userId": "u-ben", "name": "Dr. Amina Bennani", "specialties": ["Orthophonie"], "bio": "Orthophoniste clinicienne avec 12 ans d'experience.", "avatar": "female_doc_1", "guichetId": "1"},
      {"id": "sp-2", "userId": "u-amr", "name": "M. Youssef El Amrani", "specialties": ["Psychomotricité"], "bio": "Thérapeute en psychomotricité.", "avatar": "male_doc_1", "guichetId": "2"},
      {"id": "sp-3", "userId": "u-ala", "name": "Dr. Sofia Alami", "specialties": ["Neuropsychologie"], "bio": "Docteur en Neuropsychologie cognitive.", "avatar": "female_doc_2", "guichetId": "3"},
      {"id": "sp-4", "userId": "u-mez", "name": "Mme Leila Meziane", "specialties": ["Psychologie clinique"], "bio": "Psychologue clinicienne pour enfants et adolescents.", "avatar": "female_doc_3", "guichetId": "4"},
      {"id": "sp-5", "userId": "u-taz", "name": "M. Karim Tazi", "specialties": ["Ergothérapie"], "bio": "Ergothérapeute diplômé d'État.", "avatar": "male_doc_2", "guichetId": "5"},
      {"id": "sp-6", "userId": "u-aoi", "name": "Mme Fatima-Zahra Alaoui", "specialties": ["Orthoptie"], "bio": "Orthoptiste spécialisée.", "avatar": "female_doc_4", "guichetId": "6"}
    ],
    "guichets": [
      {"id": "1", "name": "Guichet 1 - Orthophonie", "specialty": "Orthophonie", "roomNumber": "Salle A01 (RDC)", "capacity": 1},
      {"id": "2", "name": "Guichet 2 - Psychomotricité", "specialty": "Psychomotricité", "roomNumber": "Salle Gym B02 (Étage 1)", "capacity": 1},
      {"id": "3", "name": "Guichet 3 - Neuropsychologie", "specialty": "Neuropsychologie", "roomNumber": "Bureau C03 (RDC)", "capacity": 1},
      {"id": "4", "name": "Guichet 4 - Psychologie", "specialty": "Psychologie clinique", "roomNumber": "Bureau C04 (RDC)", "capacity": 1},
      {"id": "5", "name": "Guichet 5 - Ergothérapie", "specialty": "Ergothérapie", "roomNumber": "Atelier D05 (Étage 1)", "capacity": 1},
      {"id": "6", "name": "Guichet 6 - Orthoptie", "specialty": "Orthoptie", "roomNumber": "Salle Optique E06 (RDC)", "capacity": 1}
    ],
    "rooms": [
      {"id": "r-1", "name": "Salle A01", "type": "Orthophonie", "specialistName": "Dr. Amina Bennani", "status": "disponible"},
      {"id": "r-2", "name": "Salle B02", "type": "Psychomotricité", "specialistName": "M. Youssef El Amrani", "status": "disponible"},
      {"id": "r-3", "name": "Bureau C03", "type": "Neuropsychologie", "specialistName": "Dr. Sofia Alami", "status": "disponible"},
      {"id": "r-4", "name": "Bureau C04", "type": "Psychologie clinique", "specialistName": "Mme Leila Meziane", "status": "disponible"},
      {"id": "r-5", "name": "Atelier D05", "type": "Ergothérapie", "specialistName": "M. Karim Tazi", "status": "disponible"},
      {"id": "r-6", "name": "Salle E06", "type": "Orthoptie", "specialistName": "Mme Fatima-Zahra Alaoui", "status": "disponible"}
    ]
  };

  localStorage.setItem('users', JSON.stringify(fullDb.users));
  localStorage.setItem('specialists', JSON.stringify(fullDb.specialists));
  localStorage.setItem('guichets', JSON.stringify(fullDb.guichets));
  localStorage.setItem('rooms', JSON.stringify(fullDb.rooms));
  localStorage.setItem('db_initialized', 'true');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
