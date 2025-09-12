import { AuthContext } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const { userData, setUserData } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        if (stored && stored !== 'test') {
          setUserData(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load userData:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return <Redirect href={userData ? '/platform/(tabs)/home' : '/(auth)/(tabs)/signin'} />;
}
