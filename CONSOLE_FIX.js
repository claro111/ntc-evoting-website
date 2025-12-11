// COPY AND PASTE THIS INTO YOUR BROWSER CONSOLE
// Make sure you're on a page where Firebase is loaded (like your admin panel)

async function quickFixVerificationDocs() {
  try {
    console.log('🔧 Quick Fix Starting...');
    
    // Get Firestore and Storage references
    const { collection, getDocs, doc, updateDoc } = await import('firebase/firestore');
    const { ref, listAll, getDownloadURL } = await import('firebase/storage');
    const { db } = await import('./src/config/firebase.js');
    const { storage } = await import('./src/config/firebase.js');
    
    // Get all voters without verification URLs
    const votersRef = collection(db, 'voters');
    const snapshot = await getDocs(votersRef);
    
    let fixed = 0;
    
    for (const docSnap of snapshot.docs) {
      const voter = docSnap.data();
      const voterId = docSnap.id;
      
      // Skip if already has URL
      if (voter.verificationDocUrl) continue;
      
      try {
        // Check storage
        const storageRef = ref(storage, `verification_docs/${voterId}`);
        const listResult = await listAll(storageRef);
        
        if (listResult.items.length > 0) {
          const fileRef = listResult.items[0];
          const downloadURL = await getDownloadURL(fileRef);
          
          // Update Firestore
          await updateDoc(doc(db, 'voters', voterId), {
            verificationDocUrl: downloadURL,
            verificationDocName: fileRef.name
          });
          
          console.log(`✅ Fixed: ${voter.fullName || voter.email}`);
          fixed++;
        }
      } catch (error) {
        console.error(`❌ Error with ${voter.fullName}:`, error);
      }
    }
    
    console.log(`🎉 Fixed ${fixed} voters!`);
    alert(`Fixed ${fixed} verification documents!`);
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    alert('Fix failed: ' + error.message);
  }
}

// Run the fix
quickFixVerificationDocs();