import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('subs').select('*').eq('active', true).order('name');
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch subs' });
    }
  }
  if (req.method === 'POST') {
    try {
      const { name, phone, split } = req.body;
      if (!name) return res.status(400).json({ error: 'Name required' });
      const { data, error } = await supabase.from('subs').insert({ name, phone, split: split || '60/40' }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create sub' });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
