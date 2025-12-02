import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

/*import admin from 'firebase-admin';
import { type ServiceAccount} from 'firebase-admin/app';
import {Buffer} from "buffer";

const privateKey = process.env.NEXT_FIREBASE_CREDS_PRIVATE_KEY ? Buffer.from(process.env.NEXT_FIREBASE_CREDS_PRIVATE_KEY, 'base64').toString().replace(/\\n/g, '\n') : undefined;

const serviceAccount: ServiceAccount = {
  type: process.env.NEXT_FIREBASE_CREDS_TYPE,
  projectId: process.env.NEXT_FIREBASE_CREDS_PROJECT_ID,
  privateKeyId: process.env.NEXT_FIREBASE_CREDS_PRIVATE_KEY_ID,
  privateKey,
  clientEmail: process.env.NEXT_FIREBASE_CREDS_CLIENT_EMAIL,
  clientId: process.env.NEXT_FIREBASE_CREDS_CLIENT_ID,
  authUri: process.env.NEXT_FIREBASE_CREDS_AUTH_URI,
  tokenUri: process.env.NEXT_FIREBASE_CREDS_TOKEN_URI,
  authProviderX509CertUrl: process.env.NEXT_FIREBASE_CREDS_AUTH_PROVIDER_X509_CERT_URL,
  clientX509CertUrl: process.env.NEXT_FIREBASE_CREDS_CLIENT_X509_CERT_URL,
  universeDomain: process.env.NEXT_FIREBASE_CREDS_UNIVERSE_DOMAIN
} as ServiceAccount;


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }); // uses ADC on Cloud Run
}
export const db = admin.firestore();*/

// Client-side Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase on client-side only
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== "undefined") {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

// Export the initialized services
export { app, auth, db };

export const getIdToken = async (): Promise<string | null> => {
  if (!auth) {
    console.warn("Auth not initialized");
    return null;
  }

  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  try {
    return await user.getIdToken();
  } catch (error) {
    console.error("Error getting ID token:", error);
    return null;
  }
};

// Auth initialization is now handled in AuthContext
