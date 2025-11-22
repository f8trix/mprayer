const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ message: 'CORS preflight' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      const healthStatus = {
        status: error ? 'ERROR' : 'OK',
        timestamp: new Date().toISOString(),
        database: {
          connected: !error,
          error: error ? error.message : null
        }
      };

      res.setHeader('Content-Type', 'application/json');
      res.json(healthStatus);
    } catch (error) {
      res.status(500).json({ 
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};