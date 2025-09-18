// Firebase se data automatically export karne ke liye script

const admin = require('firebase-admin');

// Service account key jo aapne download ki hai
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com` 
});

const db = admin.firestore();
const fs = require('fs');
const path = require('path');

async function exportCollection(collectionName) {
  try {
    console.log(`Starting export for '${collectionName}'...`);
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`No documents found in '${collectionName}'. Creating an empty file.`);
      fs.writeFileSync(path.join(__dirname, `${collectionName}.json`), '[]');
      return;
    }

    const data = [];
    snapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });

    const jsonContent = JSON.stringify(data, null, 2);
    fs.writeFileSync(path.join(__dirname, `${collectionName}.json`), jsonContent);
    console.log(`✅ Successfully exported ${data.length} documents from '${collectionName}' to ${collectionName}.json`);

  } catch (error) {
    console.error(`❌ Error exporting '${collectionName}':`, error);
  }
}

async function runExport() {
  console.log('--- Starting Firebase Data Export ---');
  await exportCollection('users');
  await exportCollection('clients');
  await exportCollection('jobfiles');
  // Agar aapko aur collections export karni hain (jaise 'deleted_jobfiles'), to neeche line add karein:
  // await exportCollection('deleted_jobfiles'); 
  console.log('--- All exports complete! ---');
}

runExport();
