import { db } from './firebase';
import { 
  type User, 
  type InsertUser,
  type Visitor,
  type InsertVisitor,
  type ChurchSettings,
  type InsertChurchSettings
} from "@shared/schema";
import type { IStorage } from "./storage";
import { randomUUID } from "crypto";

export class FirebaseStorage implements IStorage {
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
    if (!db) {
      throw new Error('Firebase not configured. Please provide FIREBASE_SERVICE_ACCOUNT_KEY.');
    }

    const visitor: Visitor = {
      id: randomUUID(),
      ...insertVisitor,
      submissionDate: new Date(),
    };

    await db.collection('visitors').doc(visitor.id).set({
      ...visitor,
      submissionDate: visitor.submissionDate.toISOString(),
    });

    return visitor;
  }

  async getVisitors(): Promise<Visitor[]> {
    if (!db) {
      throw new Error('Firebase not configured. Please provide FIREBASE_SERVICE_ACCOUNT_KEY.');
    }

    const snapshot = await db.collection('visitors')
      .orderBy('submissionDate', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        submissionDate: new Date(data.submissionDate),
      } as Visitor;
    });
  }

  async getVisitor(id: string): Promise<Visitor | undefined> {
    if (!db) {
      throw new Error('Firebase not configured. Please provide FIREBASE_SERVICE_ACCOUNT_KEY.');
    }

    const doc = await db.collection('visitors').doc(id).get();
    if (!doc.exists) {
      return undefined;
    }

    const data = doc.data()!;
    return {
      ...data,
      id: doc.id,
      submissionDate: new Date(data.submissionDate),
    } as Visitor;
  }

  async getChurchSettings(): Promise<ChurchSettings | undefined> {
    if (!db) {
      throw new Error('Firebase not configured. Please provide FIREBASE_SERVICE_ACCOUNT_KEY.');
    }

    const snapshot = await db.collection('churchSettings').limit(1).get();
    if (snapshot.empty) {
      return undefined;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      updatedAt: new Date(data.updatedAt),
    } as ChurchSettings;
  }

  async updateChurchSettings(insertSettings: InsertChurchSettings): Promise<ChurchSettings> {
    if (!db) {
      throw new Error('Firebase not configured. Please provide FIREBASE_SERVICE_ACCOUNT_KEY.');
    }

    // Check if settings exist
    const existing = await this.getChurchSettings();
    const now = new Date();
    
    if (existing) {
      const settings: ChurchSettings = {
        ...insertSettings,
        id: existing.id,
        updatedAt: now,
      };

      await db.collection('churchSettings').doc(existing.id).update({
        ...insertSettings,
        updatedAt: now.toISOString(),
      });

      return settings;
    } else {
      const id = randomUUID();
      const settings: ChurchSettings = {
        ...insertSettings,
        id,
        updatedAt: now,
      };

      await db.collection('churchSettings').doc(id).set({
        ...insertSettings,
        updatedAt: now.toISOString(),
      });

      return settings;
    }
  }
}