import { useState, useEffect } from 'react';
import { getAuth, onIdTokenChanged } from 'firebase/auth';

const useAuth = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken(true);
          setToken(idToken);
          setUser(currentUser);
          setError(null);
          console.log('Token refreshed');
        } catch (err) {
          setError('Failed to refresh token');
          console.error(err);
        }
      } else {
        setToken(null);
        setUser(null);
        setError('User not signed in');
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchWithAuth = async (url, options = {}) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    try {
      let response = await fetch(url, { ...options, headers });
      if (response.status === 401 && user) {
        // Retry with fresh token
        const newToken = await user.getIdToken(true);
        setToken(newToken);
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      }
      return response;
    } catch (err) {
      throw new Error(`Fetch error: ${err.message}`);
    }
  };

  return { token, user, error, fetchWithAuth };
};

export default useAuth;