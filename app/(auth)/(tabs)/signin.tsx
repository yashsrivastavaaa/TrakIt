import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { and, eq } from 'drizzle-orm';
import { router } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LoginTopBox from '@/components/LoginTopBox';
import ThemedAlert from '@/components/ThemedAlert';
import { user } from '@/config/users';
import { userSchema } from '@/config/userSchema';
import { AuthContext } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setUserData } = useContext(AuthContext);

    // alert states
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    const isValidEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);



    const login = async () => {
        if (!email || !password) {
            setAlertTitle('Error');
            setAlertMessage('Please enter both email and password.');
            setAlertVisible(true);
            return;
        }

        if (!isValidEmail(email)) {
            setAlertTitle('Error');
            setAlertMessage('Please enter a valid email address.');
            setAlertVisible(true);
            return;
        }

        setLoading(true);

        try {
            const result = await user
                .select()
                .from(userSchema)
                .where(and(eq(userSchema.email, email), eq(userSchema.password, password)));

            if (result.length > 0) {
                const userObj = result[0];
                setUserData(userObj);
                await AsyncStorage.setItem('userData', JSON.stringify(userObj));

                setAlertTitle('Success');
                setAlertMessage('Login successful.');
                setAlertVisible(true);
            } else {
                setAlertTitle('Error');
                setAlertMessage('Invalid email or password.');
                setAlertVisible(true);
            }
        } catch (error) {
            console.error('Login error:', error);
            setAlertTitle('Error');
            setAlertMessage('Something went wrong. Please try again.');
            setAlertVisible(true);
        } finally {
            setLoading(false);
        }

    };


    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={{ textAlign: 'center', color: 'white' }}>v1.2</Text>
                    <LoginTopBox />
                    <Text style={styles.welcomeText}>Welcome Back!</Text>
                    <Text style={styles.subtitleText}>Sign in to continue</Text>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="email" size={22} color="#ccc" style={styles.icon} />
                        <TextInput
                            placeholder="Enter Your Email ID"
                            placeholderTextColor="#aaa"
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Entypo name="lock" size={22} color="#ccc" style={styles.icon} />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#aaa"
                            style={styles.input}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                            <Entypo
                                name={showPassword ? 'eye' : 'eye-with-line'}
                                size={22}
                                color="#ccc"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Sign In Button */}
                    <TouchableOpacity
                        onPress={login}
                        style={styles.signInButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.signInButtonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Custom Themed Alert */}
            <ThemedAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={() => {
                    setAlertVisible(false);
                    setLoading(false);
                    if (alertTitle === 'Success') {
                        router.replace('/platform/(tabs)/home'); // navigate only after closing alert
                    }
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(7,16,33)',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    welcomeText: {
        marginLeft: 25,
        fontSize: 20,
        marginTop: 70,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitleText: {
        marginLeft: 25,
        fontSize: 15,
        marginTop: 10,
        color: '#aaa',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10192D',
        marginHorizontal: 20,
        borderRadius: 30,
        paddingHorizontal: 20,
        height: 50,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#444',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#fff',
    },
    signInButton: {
        backgroundColor: '#3D5AFE',
        width: '90%',
        height: 50,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    signInButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
})


