import AntDesign from '@expo/vector-icons/AntDesign';
import { Tabs } from 'expo-router';
import React from 'react';

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                headerTitle: '',
                tabBarItemStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarIconStyle: {
                    marginTop: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    textAlign: 'center',
                    color: '#fff',
                },
                tabBarStyle: {
                    backgroundColor: '#10192D',
                    marginBottom: 20,
                    marginHorizontal: 20,
                    borderRadius: 50,
                    height: 60,
                    overflow: 'hidden',
                    position: 'absolute',
                    borderTopWidth: 0,
                },
                tabBarActiveTintColor: '#3D5AFE',
                tabBarInactiveTintColor: '#aaa',
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="user" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
