import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { generations, type Generation, type NewGeneration } from '../db/schema';
import { createCircuitBreaker } from '../config/circuitBreaker';

export class GenerationRepository {
  private findByIdBreaker;
  private findByUserIdBreaker;
  private createBreaker;

  constructor() {
    this.findByIdBreaker = createCircuitBreaker(
      this._findById.bind(this),
      'GenerationRepository.findById'
    );
    this.findByUserIdBreaker = createCircuitBreaker(
      this._findByUserId.bind(this),
      'GenerationRepository.findByUserId'
    );
    this.createBreaker = createCircuitBreaker(
      this._create.bind(this),
      'GenerationRepository.create'
    );
  }

  private async _findById(id: number): Promise<Generation | undefined> {
    const result = await db.select().from(generations).where(eq(generations.id, id)).limit(1);
    return result[0];
  }

  private async _findByUserId(userId: number, limit: number): Promise<Generation[]> {
    return db
      .select({
        id: generations.id,
        userId: generations.userId,
        prompt: generations.prompt,
        style: generations.style,
        imageUrl: generations.imageUrl,
        resultUrl: generations.resultUrl,
        status: generations.status,
        createdAt: generations.createdAt,
      })
      .from(generations)
      .where(eq(generations.userId, userId))
      .orderBy(desc(generations.createdAt))
      .limit(limit);
  }

  private async _create(generationData: NewGeneration): Promise<Generation> {
    const result = await db.insert(generations).values(generationData).returning();
    return result[0];
  }

  async findById(id: number): Promise<Generation | undefined> {
    return this.findByIdBreaker.fire(id);
  }

  async findByUserId(userId: number, limit = 5): Promise<Generation[]> {
    return this.findByUserIdBreaker.fire(userId, limit);
  }

  async create(generationData: NewGeneration): Promise<Generation> {
    return this.createBreaker.fire(generationData);
  }

  async update(id: number, data: Partial<Generation>): Promise<Generation | undefined> {
    const result = await db
      .update(generations)
      .set(data)
      .where(eq(generations.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(generations).where(eq(generations.id, id)).returning();
    return result.length > 0;
  }
}

export const generationRepository = new GenerationRepository();
