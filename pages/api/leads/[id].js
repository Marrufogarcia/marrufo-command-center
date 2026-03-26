import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method === 'PATCH') {
    try {
      const { data, error } = await supabase.from('leads').update(req.body).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update lead' });
    }
  }
  if (req.method === 'DELETE') {
    try {
      await supabase.from('leads').delete().eq('id', id);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete lead' });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
