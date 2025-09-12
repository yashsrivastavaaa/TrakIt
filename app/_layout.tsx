import { AuthContext } from '@/context/AuthContext';
import { Stack } from "expo-router";
import { useState } from "react";

interface USER {
  name: string;
  password: string;
  email: string;
}
export default function RootLayout() {

  const [userData, setUserData] = useState<USER | undefined>(undefined);
  return (

    <AuthContext.Provider value={{ userData, setUserData }}>
      <Stack>
        <Stack.Screen name="(auth)/(tabs)" options={{ headerShown: false, headerTitle: '' }} />
        <Stack.Screen name="platform/(tabs)" options={{ headerShown: false, headerTitle: '' }} />
        <Stack.Screen name="platform/screens/addnewjob" options={{ headerShown: false, headerTitle: '' }} />
        <Stack.Screen name="platform/screens/viewJobScreen" options={{ headerShown: false, headerTitle: '' }} />
        <Stack.Screen name="platform/screens/editScreen" options={{ headerShown: false, headerTitle: '' }} />
        <Stack.Screen name="platform/screens/changePassword" options={{ headerShown: false, headerTitle: '' }} />
        <Stack.Screen name="platform/screens/editProfileScreen" options={{ headerShown: false, headerTitle: '' }} />
        <Stack.Screen name="platform/screens/addContact" options={{ headerShown: false, headerTitle: '' }} />
        <Stack.Screen name="platform/screens/editContacts" options={{ headerShown: false, headerTitle: '' }} />
      </Stack>
    </AuthContext.Provider>

  );
}
