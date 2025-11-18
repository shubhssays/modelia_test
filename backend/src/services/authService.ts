import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../models/database';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export interface User {
  id: number;
  email: string;
  name: string;
  password?: string;
  created_at?: string;
}

export const authService = {
  async signup(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    // Check if user exists
    const existingUser = await new Promise<User | undefined>((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row: User) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const userId = await new Promise<number>((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, hashedPassword, name],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    const user: User = { id: userId, email, name };
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });

    return { user, token };
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find user
    const user = await new Promise<User | undefined>((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row: User) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password!);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  },

  verifyToken(token: string): { id: number; email: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};
