import type { Handler } from "@netlify/functions";
import admin from "firebase-admin";

// Only initialize once (Netlify cold start)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!))
  });
}

const db = admin.firestore();

export const handler: Handler = async (event) => {
  try {
    // If GET → return visitor data
    if (event.httpMethod === "GET") {
      const snapshot = await db.collection("visitors").get();
      const visitors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return {
        statusCode: 200,
        body: JSON.stringify(visitors)
      };
    }

    // If POST → save new visitor
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      await db.collection("visitors").add(body);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Visitor added" })
      };
    }

    return { statusCode: 405, body: "Method not allowed" };
  } catch (err: any) {
    return { statusCode: 500, body: err.message };
  }
};
