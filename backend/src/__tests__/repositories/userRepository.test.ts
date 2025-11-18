import { eq } from 'drizzle-orm';
import { testDb } from '../setup';
import { users, type NewUser } from '../../db/schema';

describe('UserRepository - Direct Drizzle Queries', () => {
  describe('INSERT operations', () => {
    it('should insert a new user', async () => {
      const newUser: NewUser = {
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
      };

      const result = await testDb.insert(users).values(newUser).returning();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(result[0].id).toBeDefined();
      expect(result[0].createdAt).toBeDefined();
    });

    it('should throw error on duplicate email', async () => {
      const newUser: NewUser = {
        email: 'duplicate@example.com',
        password: 'password',
        name: 'User',
      };

      await testDb.insert(users).values(newUser);

      await expect(
        testDb.insert(users).values(newUser)
      ).rejects.toThrow();
    });
  });

  describe('SELECT operations', () => {
    beforeEach(async () => {
      // Insert test data
      await testDb.insert(users).values([
        { email: 'alice@example.com', password: 'pass1', name: 'Alice' },
        { email: 'bob@example.com', password: 'pass2', name: 'Bob' },
        { email: 'charlie@example.com', password: 'pass3', name: 'Charlie' },
      ]);
    });

    it('should select all users', async () => {
      const result = await testDb.select().from(users);

      expect(result).toHaveLength(3);
      expect(result.map(u => u.email)).toContain('alice@example.com');
      expect(result.map(u => u.email)).toContain('bob@example.com');
      expect(result.map(u => u.email)).toContain('charlie@example.com');
    });

    it('should select user by email', async () => {
      const result = await testDb
        .select()
        .from(users)
        .where(eq(users.email, 'bob@example.com'))
        .limit(1);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('bob@example.com');
      expect(result[0].name).toBe('Bob');
    });

    it('should select specific columns', async () => {
      const result = await testDb
        .select({
          email: users.email,
          name: users.name,
        })
        .from(users)
        .where(eq(users.email, 'alice@example.com'));

      expect(result[0]).toEqual({
        email: 'alice@example.com',
        name: 'Alice',
      });
      expect(result[0]).not.toHaveProperty('password');
      expect(result[0]).not.toHaveProperty('id');
    });

    it('should return empty array when no match', async () => {
      const result = await testDb
        .select()
        .from(users)
        .where(eq(users.email, 'nonexistent@example.com'));

      expect(result).toHaveLength(0);
    });
  });
});
