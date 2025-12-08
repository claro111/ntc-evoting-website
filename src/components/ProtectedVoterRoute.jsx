import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const ProtectedVoterRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isVoter, setIsVoter] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is a voter
        try {
          const voterDoc = await getDoc(doc(db, 'voters', user.uid));
          if (voterDoc.exists()) {
            const voterData = voterDoc.data();
            // Only allow registered voters (email verified and approved)
            if (voterData.status === 'registered') {
              setIsVoter(true);
            } else {
              setIsVoter(false);
            }
          } else {
            setIsVoter(false);
          }
        } catch (error) {
          console.error('Error checking voter status:', error);
          setIsVoter(false);
        }
      } else {
        setIsVoter(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'white'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{ color: '#6b7280', fontSize: '16px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!isVoter) {
    return <Navigate to="/voter/login" replace />;
  }

  return children;
};

export default ProtectedVoterRoute;
