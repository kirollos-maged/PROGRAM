const { Pool } = require('pg');
const bcrypt = require('bcrypt');

(async () => {
  const password = '33rnjrNd@5YH8Yv';
  const hash = await bcrypt.hash(password, 12);
  const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/program' });
  try {
    const res = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING user_id, email, password_hash',
      [hash, 'yousefahmeds193@gmail.com'],
    );
    console.log('Updated rows:', res.rowCount);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
