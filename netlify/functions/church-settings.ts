import type { Handler } from "@netlify/functions";
import { db } from './_firebase';

export const handler: Handler = async (event) => {
  try {
    if (!db) {
      console.error("❌ Firebase not initialized");
      return {
        statusCode: 500,
        body: "Firebase initialization failed",
      };
    }

    if (event.httpMethod === "GET") {
      console.log("📍 Reading Firestore: settings/church");
      const doc = await db.collection("settings").doc("church").get();
      if (!doc.exists) {
        console.warn("⚠️ Document not found: settings/church");
        return { statusCode: 404, body: "No settings found" };
      }
      console.log("✅ Document found:", doc.data());
      return {
        statusCode: 200,
        body: JSON.stringify(doc.data()),
      };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      console.log("📍 Writing to Firestore: settings/church with", body);
      await db.collection("settings").doc("church").set(body, { merge: true });
      console.log("✅ Settings updated");
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Settings updated" }),
      };
    }

    return { statusCode: 405, body: "Method not allowed" };
  } catch (err: any) {
    console.error("🔥 Function error in church-settings:", err);
    return { statusCode: 500, body: err.message };
  }
};