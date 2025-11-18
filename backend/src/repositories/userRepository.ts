import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, type User, type NewUser } from '../db/schema';
import { createCircuitBreaker } from '../config/circuitBreaker';

export class UserRepository {
  private findByIdBreaker;
  private findByEmailBreaker;
  private createBreaker;

  constructor() {
    this.findByIdBreaker = createCircuitBreaker(
      this._findById.bind(this),
      'UserRepository.findById'
    );
    this.findByEmailBreaker = createCircuitBreaker(
      this._findByEmail.bind(this),
      'UserRepository.findByEmail'
    );
    this.createBreaker = createCircuitBreaker(
      this._create.bind(this),
      'UserRepository.create'
    );
  }

  private async _findById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  private async _findByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  private async _create(userData: NewUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async findById(id: number): Promise<User | undefined> {
    return this.findByIdBreaker.fire(id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.findByEmailBreaker.fire(email);
  }

  async create(userData: NewUser): Promise<User> {
    return this.createBreaker.fire(userData);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !!user;
  }
}

export const userRepository = new UserRepository();
