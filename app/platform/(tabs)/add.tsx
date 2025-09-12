import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Add() {

    useEffect(() => {
        const navigateToHomeThenPush = () => {
            // Step 1: Programmatically navigate to the home tab.
            // This sets up the navigation stack so that 'home' is the screen we will return to.
            router.navigate('/platform/(tabs)/home');

            // Step 2: Push the 'addnewjob' screen on top of the home screen.
            router.push('/platform/screens/addnewjob');
        };

        navigateToHomeThenPush();
    }, []);

    // The loading indicator is important here. It masks the quick navigation
    // between tabs and provides a smooth visual transition for the user.
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#38BDF8" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A', // Match the app's dark theme
    }
});