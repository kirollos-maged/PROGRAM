const { Pool } = require('pg');

(async () => {
  const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/program' });
  try {
    const res = await pool.query(
      'SELECT user_id, email, role, is_active, is_email_verified, password_hash FROM users WHERE email = $1',
      ['yousefahmeds193@gmail.com'],
    );
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
