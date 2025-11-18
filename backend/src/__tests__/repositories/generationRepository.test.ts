import { eq, desc } from 'drizzle-orm';
import { testDb } from '../setup';
import { users, generations, type NewGeneration } from '../../db/schema';

describe('GenerationRepository - Direct Drizzle Queries', () => {
  let userId: number;

  // Create a test user before each test
  beforeEach(async () => {
    const userResult = await testDb.insert(users).values({
      email: 'testuser@example.com',
      password: 'password',
      name: 'Test User',
    }).returning();
    userId = userResult[0].id;
  });

  describe('INSERT operations', () => {
    it('should insert a new generation', async () => {
      const newGeneration: NewGeneration = {
        userId,
        prompt: 'A beautiful sunset',
        style: 'realistic',
        imageUrl: '/files/user1/image.jpg',
        resultUrl: '/files/user1/result.jpg',
        status: 'pending',
      };

      const result = await testDb.insert(generations).values(newGeneration).returning();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        userId,
        prompt: 'A beautiful sunset',
        style: 'realistic',
        imageUrl: '/files/user1/image.jpg',
        resultUrl: '/files/user1/result.jpg',
        status: 'pending',
      });
      expect(result[0].id).toBeDefined();
      expect(result[0].createdAt).toBeDefined();
    });

    it('should insert generation with minimal required fields', async () => {
      const newGeneration: NewGeneration = {
        userId,
        prompt: 'Test prompt',
        style: 'cartoon',
        imageUrl: '/files/user1/image.jpg',
      };

      const result = await testDb.insert(generations).values(newGeneration).returning();

      expect(result[0].prompt).toBe('Test prompt');
      expect(result[0].style).toBe('cartoon');
      expect(result[0].status).toBe('pending'); // default value
      expect(result[0].resultUrl).toBeNull();
    });

    it('should insert multiple generations', async () => {
      const newGenerations: NewGeneration[] = [
        { userId, prompt: 'Prompt 1', style: 'realistic', imageUrl: '/files/user1/img1.jpg', status: 'pending' },
        { userId, prompt: 'Prompt 2', style: 'cartoon', imageUrl: '/files/user1/img2.jpg', status: 'completed' },
      ];

      const result = await testDb.insert(generations).values(newGenerations).returning();

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('pending');
      expect(result[1].status).toBe('completed');
    });

    it('should throw error when userId does not exist', async () => {
      const invalidGeneration: NewGeneration = {
        userId: 99999,
        prompt: 'Test',
        style: 'realistic',
        imageUrl: '/files/invalid/image.jpg',
        status: 'pending',
      };

      await expect(
        testDb.insert(generations).values(invalidGeneration)
      ).rejects.toThrow();
    });
  });

  describe('SELECT operations', () => {
    beforeEach(async () => {
      // Insert test generations
      await testDb.insert(generations).values([
        {
          userId,
          prompt: 'Sunset scene',
          style: 'realistic',
          imageUrl: '/files/user1/img1.jpg',
          status: 'completed',
        },
        {
          userId,
          prompt: 'Mountain landscape',
          style: 'cartoon',
          imageUrl: '/files/user1/img2.jpg',
          status: 'pending',
        },
        {
          userId,
          prompt: 'Ocean view',
          style: 'realistic',
          imageUrl: '/files/user1/img3.jpg',
          status: 'failed',
        },
      ]);
    });

    it('should select all generations for a user', async () => {
      const result = await testDb
        .select()
        .from(generations)
        .where(eq(generations.userId, userId));

      expect(result).toHaveLength(3);
      expect(result.every(g => g.userId === userId)).toBe(true);
    });

    it('should select generations ordered by createdAt desc', async () => {
      const result = await testDb
        .select()
        .from(generations)
        .where(eq(generations.userId, userId))
        .orderBy(desc(generations.id));

      expect(result).toHaveLength(3);
      // Latest inserted should be first (highest id)
      expect(result[0].prompt).toBe('Ocean view');
      expect(result[2].prompt).toBe('Sunset scene');
    });

    it('should limit results', async () => {
      const result = await testDb
        .select()
        .from(generations)
        .where(eq(generations.userId, userId))
        .orderBy(desc(generations.id))
        .limit(2);

      expect(result).toHaveLength(2);
    });

    it('should select generation by id', async () => {
      const allGenerations = await testDb.select().from(generations);
      const generationId = allGenerations[0].id;

      const result = await testDb
        .select()
        .from(generations)
        .where(eq(generations.id, generationId))
        .limit(1);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(generationId);
    });

    it('should select specific columns', async () => {
      const result = await testDb
        .select({
          id: generations.id,
          status: generations.status,
          imageUrl: generations.imageUrl,
        })
        .from(generations)
        .where(eq(generations.userId, userId))
        .limit(1);

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('status');
      expect(result[0]).toHaveProperty('imageUrl');
      expect(result[0]).not.toHaveProperty('userId');
      expect(result[0]).not.toHaveProperty('prompt');
    });
  });
});
