const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/program' });

const users = [
  {
    email: 'student@example.com',
    password: 'Student123!',
    firstName: 'Student',
    lastName: 'User',
    role: 'student',
  },
  {
    email: 'instructor@example.com',
    password: 'Instructor123!',
    firstName: 'Instructor',
    lastName: 'User',
    role: 'instructor',
  },
];

(async () => {
  try {
    for (const item of users) {
      const hash = await bcrypt.hash(item.password, 12);
      const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', [item.email]);
      let userId;
      if (existing.rows.length > 0) {
        userId = existing.rows[0].user_id;
        await pool.query(
          'UPDATE users SET password_hash = $1, first_name = $2, last_name = $3, role = $4, is_active = true, is_email_verified = true, updated_at = NOW() WHERE user_id = $5',
          [hash, item.firstName, item.lastName, item.role, userId]
        );
        console.log(`Updated user ${item.email}`);
      } else {
        const insertResult = await pool.query(
          'INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, is_email_verified) VALUES ($1, $2, $3, $4, $5, true, true) RETURNING user_id',
          [item.email, hash, item.firstName, item.lastName, item.role]
        );
        userId = insertResult.rows[0].user_id;
        console.log(`Created user ${item.email}`);
      }

      if (item.role === 'student') {
        const student = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [userId]);
        if (student.rows.length === 0) {
          await pool.query('INSERT INTO students (user_id, bio) VALUES ($1, $2)', [userId, 'Example student account']);
          console.log(`Created student profile for ${item.email}`);
        }
      }

      if (item.role === 'instructor') {
        const instructor = await pool.query('SELECT instructor_id FROM instructors WHERE user_id = $1', [userId]);
        if (instructor.rows.length === 0) {
          await pool.query('INSERT INTO instructors (user_id, bio, title) VALUES ($1, $2, $3)', [userId, 'Example instructor account', 'Lead Instructor']);
          console.log(`Created instructor profile for ${item.email}`);
        }
      }

      console.log(`Credentials for ${item.role}: ${item.email} / ${item.password}`);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
