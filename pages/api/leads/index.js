import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    try {
      const body = req.body;
      let name, phone, vehicle, service, notes, source;

      if (body && body.fields) {
        name = body.fields.name || '';
        phone = body.fields.phone || '';
        vehicle = body.fields.vehicle || '';
        service = body.fields.service || '';
        notes = body.fields.notes || '';
        source = 'Website Form';
      } else {
        name = body.name || '';
        phone = body.phone || '';
        vehicle = body.vehicle || '';
        service = body.service || '';
        notes = body.notes || '';
        source = body.source || 'Website Form';
      }

      if (!name && !phone) return res.status(200).json({ success: true });

      const { data, error } = await supabase.from('leads').insert({
        name, phone, vehicle: vehicle || null, service: service || null,
        source, notes: notes || null, is_xl: false, status: 'new',
      }).select().single();
      if (error) throw error;
      return res.status(200).json({ success: true, lead: data });
    } catch (err) {
      console.error(err);
      return res.status(200).json({ success: true });
    }
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch leads' });
    }
  }

  return res.status(200).json({ success: true });
}
