import type { Handler } from "@netlify/functions";
import admin from "firebase-admin";

// 🔒 Safe Firebase Initialization
let db: FirebaseFirestore.Firestore;

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!)
      ),
    });
  }
  db = admin.firestore();
} catch (initError) {
  console.error("Firebase init error:", initError);
}

// 🚀 Main Handler
export const handler: Handler = async (event) => {
  try {
    if (!db) {
      return {
        statusCode: 500,
        body: "Firebase initialization failed",
      };
    }

    if (event.httpMethod === "GET") {
      const snapshot = await db.collection("visitors").get();
      const visitors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return {
        statusCode: 200,
        body: JSON.stringify(visitors),
      };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      await db.collection("visitors").add(body);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Visitor added" }),
      };
    }

    return { statusCode: 405, body: "Method not allowed" };
  } catch (err: any) {
    console.error("Function error:", err);
    return { statusCode: 500, body: err.message };
  }
};