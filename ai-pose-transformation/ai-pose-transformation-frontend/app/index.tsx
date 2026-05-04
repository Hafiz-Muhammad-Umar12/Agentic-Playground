import { Redirect } from 'expo-router';
import { useAuthStore } from '../services/authStore';

export default function Index() {
  const token = useAuthStore((s) => s.token);
  return <Redirect href={token ? '/screens/HomeScreen' : '/screens/LoginScreen'} />;
}
