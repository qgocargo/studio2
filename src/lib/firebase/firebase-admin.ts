
import * as admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It's designed to be safely called multiple times, as it checks
// if an app has already been initialized.
export function initAdminApp() {
  if (admin.apps.length > 0) {
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must be formatted correctly.
        // Replace \\n with \n from the environment variable.
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}
