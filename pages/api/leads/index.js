import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    try {
      const { name, phone, vehicle, service, source, notes, is_xl } = req.body;
      if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });
      const { data, error } = await supabase.from('leads').insert({
        name, phone, vehicle: vehicle || null, service: service || null,
        source: source || 'Website Form', notes: notes || null, is_xl: is_xl || false, status: 'new',
      }).select().single();
      if (error) throw error;
      return res.status(201).json({ success: true, lead: data });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create lead' });
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

  return res.status(405).json({ error: 'Method not allowed' });
}
