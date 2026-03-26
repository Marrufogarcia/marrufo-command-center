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

      if (body.fields) {
        const f = body.fields;
        if (typeof f === 'object' && !Array.isArray(f)) {
          name = f.name || f.Name || '';
          phone = f.phone || f.Phone || f['phone-number'] || '';
          vehicle = f.vehicle || f.Vehicle || f['vehicle-make-model-year'] || '';
          service = f.service || f.Service || f['select-a-service'] || '';
          notes = f.notes || f.Notes || f['anything-you-want-to-tell-us'] || f.message || '';
        }
      } else if (body.form_fields) {
        const f = body.form_fields;
        name = f.name || f.Name || '';
        phone = f.phone || f.Phone || '';
        vehicle = f.vehicle || f.Vehicle || '';
        service = f.service || f.Service || '';
        notes = f.notes || f.Notes || f.message || '';
      } else {
        name = body.name || body.Name || '';
        phone = body.phone || body.Phone || '';
        vehicle = body.vehicle || body.Vehicle || '';
        service = body.service || body.Service || '';
        notes = body.notes || body.Notes || body.message || '';
      }

      if (!name && !phone) {
        const all = JSON.stringify(body);
        await supabase.from('leads').insert({
          name: 'Unknown', phone: 'Check notes', vehicle: null, service: null,
          source: 'Website Form', notes: 'Raw data: ' + all.substring(0, 500), is_xl: false, status: 'new',
        });
        return res.status(200).json({ success: true });
      }

      await supabase.from('leads').insert({
        name, phone, vehicle: vehicle || null, service: service || null,
        source: 'Website Form', notes: notes || null, is_xl: false, status: 'new',
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
      return res.status(500).json({ error: 'Failed to fetch leads' });
    }
  }

  return res.status(200).json({ success: true });
}
