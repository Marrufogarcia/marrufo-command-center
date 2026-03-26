import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    try {
      const raw = JSON.stringify(req.body || {});
      const headers = JSON.stringify(req.headers['content-type'] || 'none');

      await supabase.from('leads').insert({
        name: 'DEBUG',
        phone: 'Check notes',
        vehicle: null,
        service: null,
        source: 'Website Form',
        notes: 'Content-Type: ' + headers + ' | Body: ' + raw.substring(0, 900),
        is_xl: false,
        status: 'new',
      });

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(200).json({ success: true, error: String(err) });
    }
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed' });
    }
  }

  return res.status(200).json({ success: true });
}
