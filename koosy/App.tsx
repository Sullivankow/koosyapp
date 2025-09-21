import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/Homescreen';

import BiensScreen from './screens/BiensScreen';
import TachesScreen from './screens/TachesScreen';
import CalendrierScreen from './screens/CalendrierScreen';
import CarteScreen from './screens/CarteScreen';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import React, { useState, useEffect } from 'react';
import { getSession, saveSession, clearSession, generateToken } from './utils/session';
import { initDefaultUsers } from './utils/users';
import { View, Text, Button } from 'react-native';
import { ThemeProvider } from './contexts/ThemeContext';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import ParametresStack from './screens/navigation/ParametresStack';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);


  useEffect(() => {
    // Initialise les utilisateurs par défaut au démarrage
    initDefaultUsers();
    // Simule le chargement (ex: 1.2 secondes)
    const timer = setTimeout(async () => {
      const sess = await getSession();
      if (sess?.token) {
        setIsLoggedIn(true);
      }
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SplashScreen />;

  // Auth flow
  if (!isLoggedIn) {
    if (showWelcome) {
      return <WelcomeScreen onFinish={() => { setShowWelcome(false); setIsLoggedIn(true); }} />;
    }
    if (showSignup) {
      return (
        <SignupScreen
          onSignupSuccess={async (email?: string) => {
            setShowSignup(false);
            const token = generateToken();
            await saveSession(email || '', token);
            setShowWelcome(true);
          }}
          onBack={() => setShowSignup(false)}
        />
      );
    }
    if (showForgotPassword) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, marginBottom: 20 }}>Mot de passe oublié (à créer)</Text>
          <Button title="Retour" onPress={() => setShowForgotPassword(false)} />
        </View>
      );
    }
    return (
      <LoginScreen
        onLogin={async (email?: string) => {
          const sess = await getSession();
          if (sess?.token && sess?.email === email) {
            setIsLoggedIn(true);
          } else {
            const token = generateToken();
            await saveSession(email || '', token);
            setIsLoggedIn(true);
          }
        }}
        onSignup={() => setShowSignup(true)}
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    );
  }

  // App principale
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              switch (route.name) {
                case 'Accueil':
                  return <MaterialCommunityIcons name="home" size={size} color={color} />;
                case 'Biens':
                  return <FontAwesome5 name="building" size={size} color={color} />;
                case 'Tâches':
                  return <MaterialCommunityIcons name="clipboard-list" size={size} color={color} />;
                case 'Calendrier':
                  return <MaterialCommunityIcons name="calendar" size={size} color={color} />;
                case 'Carte':
                  return <MaterialCommunityIcons name="map-marker" size={size} color={color} />;
                case 'Locataire':
                  return <FontAwesome5 name="users" size={size} color={color} />;
                default:
                  return null;
              }
            },
            tabBarActiveTintColor: '#009688',
            tabBarInactiveTintColor: '#6E7B8B',
            headerTitleAlign: 'center',
            headerStyle: { height: 48 }, // paddingTop supprimé
            headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
          })}
        >
          <Tab.Screen name="Accueil">
            {() => (
              <HomeScreen
                onLogout={async () => {
                  await clearSession();
                  setIsLoggedIn(false);
                }}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Biens" component={BiensScreen} />
          <Tab.Screen name="Tâches" component={TachesScreen} />
          <Tab.Screen name="Réserv." component={CalendrierScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="calendar-check" size={size} color={color} />
              ),
              tabBarLabel: 'Réserv.'
            }}
          />
          <Tab.Screen name="Carte" component={CarteScreen} />
          <Tab.Screen name="Param." component={ParametresStack}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cog" size={size} color={color} />
              ),
              tabBarLabel: 'Param.'
            }}
          />

        </Tab.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

