import AntDesign from '@expo/vector-icons/AntDesign';
import { Tabs, router } from 'expo-router';
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
                name="analyticsPage"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="linechart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="add"
                options={{
                    title: 'Add',
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="plus" size={size} color={color} />
                    ),
                }}
                listeners={{

                    tabPress: (e) => {

                        e.preventDefault();

                        router.push('/platform/screens/addnewjob');
                    },
                }}
            />

            <Tabs.Screen
                name="contacts"
                options={{
                    title: 'Contacts',
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="contacts" size={size} color={color} />
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