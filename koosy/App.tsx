import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/Homescreen';
import LocatairesScreen from './screens/LocatairesScreen';
import BiensScreen from './screens/BiensScreen';
import TachesScreen from './screens/TachesScreen';
import CalendrierScreen from './screens/CalendrierScreen';
import CarteScreen from './screens/CarteScreen';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    // Simule le chargement (ex: 2 secondes)
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isLoggedIn) {
    if (showSignup) {
      return (
        <SignupScreen
          onSignupSuccess={() => {
            setShowSignup(false);
            setIsLoggedIn(true); // Connecte l'utilisateur après inscription
          }}
          onBack={() => setShowSignup(false)}
        />
      );
    }
    if (showForgotPassword) {
      // Remplace ceci par ton composant de réinitialisation
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, marginBottom: 20 }}>Mot de passe oublié (à créer)</Text>
          <Button title="Retour" onPress={() => setShowForgotPassword(false)} />
        </View>
      );
    }
    return (
      <LoginScreen
        onLogin={() => setIsLoggedIn(true)}
        onSignup={() => setShowSignup(true)}
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Accueil" component={HomeScreen} />
        <Tab.Screen name="Biens" component={BiensScreen} />
        <Tab.Screen name="Tâches" component={TachesScreen} />
        <Tab.Screen name="Calendrier" component={CalendrierScreen} />
        <Tab.Screen name="Carte" component={CarteScreen} />
        <Tab.Screen name="Locataire" component={LocatairesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

