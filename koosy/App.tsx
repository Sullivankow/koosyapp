// Point d'entrée principal de l'application mobile Koosy.
// Gère :
//  - le flow d'authentification (Splash -> Login/Signup -> écran de bienvenue)
//  - l'arbre de providers (thème, compteurs, refresh globaux)
//  - la navigation principale (tabs + stacks).
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/Layout/Homescreen';
import BiensScreen from './screens/Layout/BiensScreen';
import TachesScreen from './screens/Layout/TachesScreen';
import ReservationScreen from './screens/Layout/ReservationScreen';
import CarteScreen from './screens/Layout/CarteScreen';
import PrestationsScreen from './screens/Layout/PrestationsScreen';
import SplashScreen from './ui/SplashScreen';
import LoginScreen from './screens/Auth/LoginScreen';
import SignupScreen from './screens/Auth/SignupScreen';
import WelcomeScreen from './screens/Layout/WelcomeScreen';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnBoarding from './components/OnBoarding';
import { useTheme } from './contexts/ThemeContext';
import { getSession, clearSession } from './utils/session';
import { View, Text, Button } from 'react-native';
import { ThemeProvider } from './contexts/ThemeContext';
import { BienCountProvider } from './contexts/BienCountContext';
import { TacheProvider } from './contexts/TacheContext';
import { TacheCountProvider } from './contexts/TacheCountContext';
import { ReservationRefreshProvider } from './contexts/ReservationRefreshContext';
import { NotificationCountProvider } from './contexts/NotificationCountContext';
import { ChiffreAffaireRefreshProvider } from './contexts/ChiffreAffaireRefreshContext';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import ParametresStack from './screens/navigation/ParametresStack';
import NotificationScreen from './screens/Layout/NotificationScreen';
import { PrestationsCountProvider } from './contexts/PrestationsCountContext';
import { AppContext } from './contexts/AppContext';
import ListeDevisScreen from './screens/Layout/ListeDevisScreen';
import ListeFactureScreen from './screens/Layout/ListeFactureScreen';
import { GlobalRefreshProvider } from './contexts/GlobalRefreshContext';
import { logoutCurrentSession } from './utils/api';
import PlanningScreen from './screens/Layout/PlanningScreen';
import ChargesScreen from './screens/Layout/ChargesScreen';
 


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const HomeStack = createStackNavigator();

// Stack imbriquée pour l'onglet "Accueil" :
// permet de naviguer vers les écrans de devis, factures, notifications, etc.
function HomeStackScreen({ onLogout }: { onLogout?: () => void }) {

 
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain">
        {({ navigation }) => <HomeScreen onLogout={onLogout} navigation={navigation} />}
      </HomeStack.Screen>
      <HomeStack.Screen name="ListeDevisScreen" component={ListeDevisScreen} />
      <HomeStack.Screen name="ListeFactureScreen" component={ListeFactureScreen} />
      <HomeStack.Screen name="NotificationsScreen" component={NotificationScreen} />
      <HomeStack.Screen name="RepertoireProprietaireScreen" component={require('./screens/Layout/RepertoireProprietaireScreen').default} />
      <HomeStack.Screen name="TachesScreen" component={TachesScreen} />
      {/* Route utilisée par le bouton "Planning presta" depuis l'écran d'accueil. */}
      <HomeStack.Screen name="PlanningScreen" component={PlanningScreen} />
      {/* Route dédiée aux charges pour garder le dashboard principal plus léger. */}
      <HomeStack.Screen name="ChargesScreen" component={ChargesScreen} />
    </HomeStack.Navigator>
  );
}


export default function App() {
  // États principaux du shell :
  // - isLoading : affichage du Splash pendant qu'on vérifie la session
  // - isLoggedIn : indique si l'utilisateur est authentifié
  // - showSignup / showForgotPassword : écrans d'auth secondaires
  // - showWelcomeLogin : écran de bienvenue après une connexion réussie.
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showWelcomeLogin, setShowWelcomeLogin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);


  useEffect(() => {
    // SplashScreen minimum 1s
    const checkOnboarding = async () => {
      await new Promise(res => setTimeout(res, 1000));
      const seen = await AsyncStorage.getItem('koosy_onboarding_seen');
      if (!seen) {
        setShowOnboarding(true);
        setIsLoading(false);
      } else {
        // Si l'onboarding a déjà été vu, on passe à la vérification de session
        const sess = await getSession();
        if (sess?.token) {
          try {
            const user = await import('./utils/api').then(m => m.getMe());
            setIsLoggedIn(true);
          } catch (err) {
            setIsLoggedIn(false);
            await clearSession();
          }
        } else {
          setIsLoggedIn(false);
        }
        setIsLoading(false);
      }
    };
    checkOnboarding();
  }, []);

  if (isLoading) return <SplashScreen />;
  if (showOnboarding) {
    // Debug: onboarding affiché (ne pas spammer la console en prod)
    console.debug('Affichage de l\'onboarding');
    return (
      <OnBoarding
        onFinish={async () => {
          await AsyncStorage.setItem('koosy_onboarding_seen', '1');
          setShowOnboarding(false);
          setIsLoading(true); // relance la vérification de session après l'onboarding
          // relancer la vérification de session
          const sess = await getSession();
          if (sess?.token) {
            try {
              const user = await import('./utils/api').then(m => m.getMe());
              setIsLoggedIn(true);
            } catch (err) {
              setIsLoggedIn(false);
              await clearSession();
            }
          } else {
            setIsLoggedIn(false);
          }
          setIsLoading(false);
        }}
      />
    );
  }

  // Fournit le contexte global
  return (
    <AppContext.Provider value={{ setIsLoggedIn }}>
      <GlobalRefreshProvider>
        <ThemeProvider>
          <PrestationsCountProvider>
            <BienCountProvider>
              <TacheProvider>
                <TacheCountProvider>
                  <ReservationRefreshProvider>
                    <NotificationCountProvider>
                      <ChiffreAffaireRefreshProvider>
                        {/* Flow d'authentification (login / signup / mot de passe oublié / welcome) */}
                        {!isLoggedIn ? (
                        showWelcome ? (
                          <WelcomeScreen onFinish={() => { setShowWelcome(false); setIsLoggedIn(true); }} />
                        ) : showWelcomeLogin ? (
                          <WelcomeScreen onFinish={() => { setShowWelcomeLogin(false); setIsLoggedIn(true); }} />
                        ) : showSignup ? (
                          <SignupScreen
                            onSignupSuccess={async () => {
                              setShowSignup(false);
                              setShowWelcome(false);
                              setShowWelcomeLogin(false);
                              setIsLoggedIn(false);
                            }}
                            onBack={() => setShowSignup(false)}
                          />
                        ) : showForgotPassword ? (
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 22, marginBottom: 20 }}>Mot de passe oublié (à créer)</Text>
                            <Button title="Retour" onPress={() => setShowForgotPassword(false)} />
                          </View>
                        ) : (
                          <LoginScreen
                            onLogin={async (email?: string) => {
                              // Après un login réussi, LoginScreen enregistre déjà
                              // le token réel via saveSession(email, access_token).
                              // Ici on se contente d'afficher l'écran de bienvenue.
                              setShowWelcomeLogin(true);
                            }}
                            onSignup={() => setShowSignup(true)}
                            onForgotPassword={() => setShowForgotPassword(true)}
                          />
                        )
                      ) : (
                        <NavigationContainer>
                          <Stack.Navigator screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="MainTabs">
                              {() => {
                                const TabNav: React.FC = () => {
                                  const { colors } = useTheme();
                                  return (
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
                                            case 'Prestations':
                                              return <FontAwesome5 name="briefcase" size={size} color={color} />;
                                            case 'Locataire':
                                              return <FontAwesome5 name="users" size={size} color={color} />;
                                            default:
                                              return null;
                                          }
                                        },
                                        tabBarActiveTintColor: colors.primary,
                                        tabBarInactiveTintColor: colors.textSecondary,
                                        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
                                        headerTitleAlign: 'center',
                                        headerStyle: { height: 48, backgroundColor: colors.surface },
                                        headerTitleStyle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
                                      })}
                                    >
                                      <Tab.Screen name="Accueil">
                                        {() => (
                                          <HomeStackScreen
                                            onLogout={async () => {
                                              await logoutCurrentSession();
                                              setIsLoggedIn(false);
                                            }}
                                          />
                                        )}
                                      </Tab.Screen>
                                      <Tab.Screen 
                                        name="Propriétaires" 
                                        component={require('./screens/Layout/RepertoireProprietaireScreen').default}
                                        options={{
                                          tabBarIcon: ({ color, size }) => (
                                            <MaterialCommunityIcons name="account-group" size={size} color={color} />
                                          ),
                                          tabBarLabel: 'Propriétaires'
                                        }}
                                      />
                                      <Tab.Screen name="Biens" component={BiensScreen} />
                                      <Tab.Screen name="Réserv." component={ReservationScreen}
                                        options={{
                                          tabBarIcon: ({ color, size }) => (
                                            <MaterialCommunityIcons name="calendar-check" size={size} color={color} />
                                          ),
                                          tabBarLabel: 'Réserv.'
                                        }}
                                      />
                                      <Tab.Screen name="Prestations" component={PrestationsScreen} />
                                      <Tab.Screen name="Param." component={ParametresStack}
                                        options={{
                                          tabBarIcon: ({ color, size }) => (
                                            <MaterialCommunityIcons name="cog" size={size} color={color} />
                                          ),
                                          tabBarLabel: 'Param.'
                                        }}
                                      />
                                    </Tab.Navigator>
                                  );
                                };
                                return <TabNav />;
                              }}
                            </Stack.Screen>
                            <Stack.Screen name="NotificationsScreen" component={NotificationScreen} />
                            <Stack.Screen name="Carte" component={CarteScreen} />
                            <Stack.Screen name="ListeDevis" component={ListeDevisScreen} />
                            <Stack.Screen name="ListeFactureScreen" component={ListeFactureScreen} />
                            <Stack.Screen name="RepertoireProprietaireScreen" component={require('./screens/Layout/RepertoireProprietaireScreen').default} />
                          </Stack.Navigator>
                        </NavigationContainer>
                      )}
                      </ChiffreAffaireRefreshProvider>
                    </NotificationCountProvider>
                  </ReservationRefreshProvider>
                </TacheCountProvider>
              </TacheProvider>
            </BienCountProvider>
          </PrestationsCountProvider>
        </ThemeProvider>
      </GlobalRefreshProvider>
    </AppContext.Provider>
  );
}
