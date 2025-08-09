import { 
  visitors, 
  churchSettings,
  type User, 
  type InsertUser,
  type Visitor,
  type InsertVisitor,
  type ChurchSettings,
  type InsertChurchSettings
} from "@shared/schema";
// import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { FirebaseStorage } from "./firebase-storage";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Visitor methods
  createVisitor(visitor: InsertVisitor): Promise<Visitor>;
  getVisitors(): Promise<Visitor[]>;
  getVisitor(id: string): Promise<Visitor | undefined>;
  
  // Church settings methods
  getChurchSettings(): Promise<ChurchSettings | undefined>;
  updateChurchSettings(settings: InsertChurchSettings): Promise<ChurchSettings>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    // Note: For this church visitor system, we're not implementing user authentication
    // This is just to maintain the interface compatibility
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Note: For this church visitor system, we're not implementing user authentication
    // This is just to maintain the interface compatibility
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Note: For this church visitor system, we're not implementing user authentication
    // This is just to maintain the interface compatibility
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    return user;
  }

  async createVisitor(insertVisitor: InsertVisitor): Promise<Visitor> {
    const [visitor] = await db
      .insert(visitors)
      .values(insertVisitor)
      .returning();
    return visitor;
  }

  async getVisitors(): Promise<Visitor[]> {
    return await db
      .select()
      .from(visitors)
      .orderBy(desc(visitors.submissionDate));
  }

  async getVisitor(id: string): Promise<Visitor | undefined> {
    const [visitor] = await db
      .select()
      .from(visitors)
      .where(eq(visitors.id, id));
    return visitor || undefined;
  }

  async getChurchSettings(): Promise<ChurchSettings | undefined> {
    const [settings] = await db
      .select()
      .from(churchSettings)
      .limit(1);
    return settings || undefined;
  }

  async updateChurchSettings(insertSettings: InsertChurchSettings): Promise<ChurchSettings> {
    // First check if settings exist
    const existing = await this.getChurchSettings();
    
    if (existing) {
      const [updated] = await db
        .update(churchSettings)
        .set({ ...insertSettings, updatedAt: new Date() })
        .where(eq(churchSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(churchSettings)
        .values(insertSettings)
        .returning();
      return created;
    }
  }
}

// Choose storage implementation based on environment
export const storage = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
  ? new FirebaseStorage() 
  : new DatabaseStorage();
