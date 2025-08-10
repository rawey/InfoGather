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
      console.error("Firestore not initialized");
      return {
        statusCode: 500,
        body: "Firebase initialization failed",
      };
    }

    console.log("HTTP Method:", event.httpMethod);
    console.log("Raw Body:", event.body);

    if (event.httpMethod === "GET") {
      const doc = await db.collection("settings").doc("church").get();
      if (!doc.exists) {
        console.log("No settings found");
        return { statusCode: 404, body: "No settings found" };
      }
      console.log("Settings retrieved:", doc.data());
      return {
        statusCode: 200,
        body: JSON.stringify(doc.data()),
      };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      console.log("Parsed Body:", body);
      await db.collection("settings").doc("church").set(body, { merge: true });
      console.log("Settings updated");
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Settings updated" }),
      };
    }

    console.log("Method not allowed");
    return { statusCode: 405, body: "Method not allowed" };
  } catch (err: any) {
    console.error("Function error:", err);
    return { statusCode: 500, body: err.message };
  }
};