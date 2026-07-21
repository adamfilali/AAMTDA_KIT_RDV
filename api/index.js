import { createClient } from '@supabase/supabase-js';

// Initialisation du client Supabase avec les variables injectées par Vercel
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Gestion des permissions CORS pour éviter les blocages entre Casa et Oujda
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Détection de la route demandée par votre application (ex: /users, /specialists, /rooms...)
  const path = req.url.split('?')[0].replace('/api/', '').replace('/', '');

  try {
    // Si l'application demande du trafic (lecture de données)
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('app_data')
        .select('value')
        .eq('key', path || 'users')
        .single();

      if (error || !data) {
        return res.status(200).json([]);
      }
      return res.status(200).json(data.value);
    }

    // Si le client remplit un formulaire (écriture/enregistrement de rendez-vous)
    if (req.method === 'POST') {
      const newData = req.body;
      
      // 1. Récupérer l'ancienne liste
      const { data: current } = await supabase.from('app_data').select('value').eq('key', path).single();
      const list = current ? current.value : [];
      
      // 2. Ajouter le nouvel élément
      list.push(newData);
      
      // 3. Sauvegarder dans le Cloud
      await supabase.from('app_data').upsert({ key: path, value: list });
      return res.status(201).json(newData);
    }

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
