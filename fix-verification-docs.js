// Quick script to fix verification document URLs
// Run this in your browser console on a page that has Firebase initialized

async function fixVerificationDocs() {
  try {
    console.log('Starting verification document fix...');
    
    // Get all voters
    const votersSnapshot = await getDocs(collection(db, 'voters'));
    console.log(`Found ${votersSnapshot.size} voters`);
    
    let fixed = 0;
    let alreadyHasDoc = 0;
    let noStorageFile = 0;
    
    for (const docSnap of votersSnapshot.docs) {
      const voter = docSnap.data();
      const voterId = docSnap.id;
      
      console.log(`Checking voter: ${voter.fullName} (${voterId})`);
      
      // Skip if already has document URL
      if (voter.verificationDocUrl) {
        console.log(`  ✅ Already has document URL`);
        alreadyHasDoc++;
        continue;
      }
      
      try {
        // Try to find file in storage
        const verificationDocsRef = ref(storage, `verification_docs/${voterId}`);
        const listResult = await listAll(verificationDocsRef);
        
        if (listResult.items.length > 0) {
          // Get the first file (should only be one)
          const fileRef = listResult.items[0];
          const downloadURL = await getDownloadURL(fileRef);
          
          console.log(`  📄 Found file: ${fileRef.name}`);
          console.log(`  🔗 URL: ${downloadURL}`);
          
          // Update the voter document
          await updateDoc(doc(db, 'voters', voterId), {
            verificationDocUrl: downloadURL,
            verificationDocName: fileRef.name,
            updatedAt: new Date()
          });
          
          console.log(`  ✅ Fixed voter document URL`);
          fixed++;
        } else {
          console.log(`  ❌ No file found in storage`);
          noStorageFile++;
        }
      } catch (error) {
        console.error(`  ❌ Error processing voter ${voterId}:`, error);
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total voters: ${votersSnapshot.size}`);
    console.log(`Already had documents: ${alreadyHasDoc}`);
    console.log(`Fixed documents: ${fixed}`);
    console.log(`No storage file: ${noStorageFile}`);
    console.log('=================');
    
    return {
      total: votersSnapshot.size,
      alreadyHasDoc,
      fixed,
      noStorageFile
    };
    
  } catch (error) {
    console.error('Error fixing verification docs:', error);
    throw error;
  }
}

// Also create a function to check a specific voter
async function checkVoter(voterId) {
  try {
    const voterDoc = await getDoc(doc(db, 'voters', voterId));
    if (!voterDoc.exists()) {
      console.log('Voter not found');
      return;
    }
    
    const voter = voterDoc.data();
    console.log('Voter data:', voter);
    
    // Check storage
    const verificationDocsRef = ref(storage, `verification_docs/${voterId}`);
    const listResult = await listAll(verificationDocsRef);
    
    console.log(`Storage files for ${voterId}:`, listResult.items.map(item => item.name));
    
    if (listResult.items.length > 0) {
      const downloadURL = await getDownloadURL(listResult.items[0]);
      console.log('File URL:', downloadURL);
    }
    
  } catch (error) {
    console.error('Error checking voter:', error);
  }
}

// Export functions to global scope
window.fixVerificationDocs = fixVerificationDocs;
window.checkVoter = checkVoter;

console.log('Verification fix script loaded!');
console.log('Run fixVerificationDocs() to fix all missing document URLs');
console.log('Run checkVoter("voter-id") to check a specific voter');