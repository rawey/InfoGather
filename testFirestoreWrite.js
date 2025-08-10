import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./firebase/serviceAccount.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

db.collection("settings").doc("church").set({
  name: "Test Church",
  subtitle: "Hello",
})
  .then(() => console.log("✅ Write succeeded"))
  .catch(err => console.error("🔥 Write failed:", err));