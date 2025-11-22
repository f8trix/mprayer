const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).json({ message: 'CORS preflight' });
    return;
  }

  try {
    // GET /api/users - Get all users
    if (req.method === 'GET' && !req.query.id) {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('id');

      if (error) throw error;

      res.setHeader('Content-Type', 'application/json');
      res.json(users);
      return;
    }

    // GET /api/users/:id - Get user by ID
    if (req.method === 'GET' && req.query.id) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.query.id)
        .single();

      if (error) throw error;

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.json(user);
      return;
    }

    // PUT /api/users/:id/points - Update user points
    if (req.method === 'PUT' && req.query.id && req.query.action === 'points') {
      const userId = parseInt(req.query.id);
      const { points } = JSON.parse(req.body || '{}');

      if (points === undefined || points < 0) {
        res.status(400).json({ error: 'Invalid points value' });
        return;
      }

      // First get current points
      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('points')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const newPoints = currentUser.points + points;

      // Update user points
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          points: newPoints,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      res.setHeader('Content-Type', 'application/json');
      res.json(updatedUser);
      return;
    }

    // PUT /api/users/:id/set-points - Set points to specific value
    if (req.method === 'PUT' && req.query.id && req.query.action === 'set-points') {
      const userId = parseInt(req.query.id);
      const { points } = JSON.parse(req.body || '{}');

      if (points === undefined || points < 0) {
        res.status(400).json({ error: 'Invalid points value' });
        return;
      }

      // Update user points
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ 
          points: points,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      res.setHeader('Content-Type', 'application/json');
      res.json(updatedUser);
      return;
    }

    // POST /api/users/reset - Reset all points
    if (req.method === 'POST' && req.query.action === 'reset') {
      const { error } = await supabase
        .from('users')
        .update({ 
          points: 0,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      res.setHeader('Content-Type', 'application/json');
      res.json({ message: 'All points reset to zero', success: true });
      return;
    }

    res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
};