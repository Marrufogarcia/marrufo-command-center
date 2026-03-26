import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      let name = '', phone = '', vehicle = '', service = '', notes = '';

      for (const key in body) {
        const v = body[key];
        if (key.includes('[name]') && key.includes('[value]')) name = v;
        if (key.includes('[phone]') && key.includes('[value]')) phone = v;
        if (key.includes('[vehicle]') && key.includes('[value]')) vehicle = v;
        if (key.includes('[service]') && key.includes('[value]')) service = v;
        if (key.includes('[note') && key.includes('[value]')) notes = v;
        if (key.includes('[message]') && key.includes('[value]')) notes = v;
      }

      if (!name) name = body.name || 'Unknown';
      if (!phone) phone = body.phone || 'No phone';

      await supabase.from('leads').insert({
        name: name,
        phone: phone,
        vehicle: vehicle || null,
        service: service || null,
        source: 'Website Form',
        notes: notes || null,
        is_xl: false,
        status: 'new',
      });

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(200).json({ success: true });
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
