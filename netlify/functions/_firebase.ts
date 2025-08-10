import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let db: FirebaseFirestore.Firestore | null = null;

try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? path.resolve(__dirname, '../firebase/serviceAccount.json');
  console.log("📁 Using service account from:", serviceAccountPath);
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  console.log("🔍 Service Account Project ID:", serviceAccount.project_id);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  db = admin.firestore();
  db.collection("settings").get()
  .then(snapshot => console.log("✅ Firestore access confirmed. Docs:", snapshot.size))
  .catch(err => console.error("🔥 Firestore access failed:", err));
  console.log("✅ Firebase initialized");
} catch (err) {
  console.error("❌ Firebase initialization error:", err);
}

export { db };