const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ message: 'CORS preflight' });
    return;
  }

  if (req.method === 'GET') {
    try {
      // Get all users
      const { data: users, error } = await supabase
        .from('users')
        .select('*');

      if (error) throw error;

      // Calculate statistics
      const group1Total = users.filter(u => u.group_name === 'group1').reduce((sum, user) => sum + user.points, 0);
      const group2Total = users.filter(u => u.group_name === 'group2').reduce((sum, user) => sum + user.points, 0);
      const group3Total = users.filter(u => u.group_name === 'group3').reduce((sum, user) => sum + user.points, 0);
      
      const totalPoints = group1Total + group2Total + group3Total;
      const totalUsers = users.length;
      const averagePoints = totalUsers > 0 ? (totalPoints / totalUsers).toFixed(2) : 0;

      const summary = {
        group1Total,
        group2Total,
        group3Total,
        totalPoints,
        totalUsers,
        averagePoints,
        lastUpdate: new Date().toISOString()
      };

      res.setHeader('Content-Type', 'application/json');
      res.json(summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};