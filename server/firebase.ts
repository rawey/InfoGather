import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin SDK
let app;
if (getApps().length === 0) {
  let serviceAccount = null;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Production: Use environment variable
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error);
    }
  } else {
    // Development: Try to read from credentials file
    const credentialsPath = path.join(process.cwd(), 'firebase-credentials.json');
    if (fs.existsSync(credentialsPath)) {
      try {
        const credentialsData = fs.readFileSync(credentialsPath, 'utf8');
        serviceAccount = JSON.parse(credentialsData);
        console.log('Firebase credentials loaded from file');
      } catch (error) {
        console.error('Failed to read firebase-credentials.json:', error);
      }
    }
  }
  
  if (serviceAccount) {
    app = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log(`Firebase initialized for project: ${serviceAccount.project_id}`);
  } else {
    console.warn('Firebase not configured. Please provide FIREBASE_SERVICE_ACCOUNT_KEY environment variable or firebase-credentials.json file.');
    app = null;
  }
} else {
  app = getApps()[0];
}

export const db = app ? getFirestore(app) : null;
export { app };