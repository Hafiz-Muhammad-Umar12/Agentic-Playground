import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../services/authStore';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, loadToken, token } = useAuthStore();

  useEffect(() => { loadToken(); }, []);
  useEffect(() => { if (token) router.replace('/screens/HomeScreen'); }, [token]);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
    const ok = await login(email.trim(), password);
    if (ok) router.replace('/screens/HomeScreen');
    else Alert.alert('Login Failed', error || 'Invalid credentials');
  };

  return (
    <LinearGradient colors={['#0a0a0a', '#111827', '#0a0a0a']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🤖</Text>
          </View>
          <Text style={styles.title}>PoseAI</Text>
          <Text style={styles.subtitle}>Real-time AI Pose Coaching</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#4B5563"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#4B5563"
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.btnText}>Sign In</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/screens/RegisterScreen')}>
            <Text style={styles.link}>Don't have an account? <Text style={styles.linkAccent}>Register</Text></Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  inner:      { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logoArea:   { alignItems: 'center', marginBottom: 48 },
  logoIcon:   { width: 80, height: 80, borderRadius: 24, backgroundColor: '#00FFB2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoEmoji:  { fontSize: 40 },
  title:      { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  subtitle:   { fontSize: 14, color: '#6B7280', marginTop: 6, letterSpacing: 1 },
  form:       { gap: 12 },
  label:      { color: '#9CA3AF', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  input:      { backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151', borderRadius: 14, padding: 16, color: '#fff', fontSize: 16, marginBottom: 8 },
  btn:        { backgroundColor: '#00FFB2', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8 },
  btnText:    { color: '#000', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  link:       { color: '#6B7280', textAlign: 'center', marginTop: 20, fontSize: 14 },
  linkAccent: { color: '#00FFB2', fontWeight: '700' },
});
