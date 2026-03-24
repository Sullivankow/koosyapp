import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/Layout/Homescreen';
import BiensScreen from './screens/Layout/BiensScreen';
import TachesScreen from './screens/Layout/TachesScreen';
import ReservationScreen from './screens/Layout/ReservationScreen';
import CarteScreen from './screens/Layout/CarteScreen';
import PrestationsScreen from './screens/Layout/PrestationsScreen';
import SplashScreen from './components/ui/SplashScreen';
import LoginScreen from './screens/Auth/LoginScreen';
import SignupScreen from './screens/Auth/SignupScreen';
import WelcomeScreen from './screens/Layout/WelcomeScreen';
import React, { useState, useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { getSession, saveSession, clearSession, generateToken } from './utils/session';
import { initDefaultUsers } from './utils/users';
import { View, Text, Button } from 'react-native';
import { ThemeProvider } from './contexts/ThemeContext';
import { BienCountProvider } from './contexts/BienCountContext';
import { TacheProvider } from './contexts/TacheContext';
import { TacheCountProvider } from './contexts/TacheCountContext';
import { ReservationRefreshProvider } from './contexts/ReservationRefreshContext';
import { NotificationCountProvider } from './contexts/NotificationCountContext';
import { ChiffreAffaireRefreshProvider } from './contexts/ChiffreAffaireRefreshContext';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import ParametresStack from './screens/Navigation/ParametresStack';
import NotificationScreen from './screens/Layout/NotificationScreen';
import { PrestationsCountProvider } from './contexts/PrestationsCountContext';
import { AppContext } from './contexts/AppContext';
import ListeDevisScreen from './screens/Layout/ListeDevisScreen';
import ListeFactureScreen from './screens/Layout/ListeFactureScreen';
import { GlobalRefreshProvider } from './contexts/GlobalRefreshContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const HomeStack = createStackNavigator();

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
    </HomeStack.Navigator>
  );
}


export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showWelcomeLogin, setShowWelcomeLogin] = useState(false);

  useEffect(() => {
    // Récupération des infos utilisateur depuis la base de données (API)
    const timer = setTimeout(async () => {
      const sess = await getSession();
      if (sess?.token) {
        try {
          const user = await import('./utils/api').then(m => m.getMe());
          // Sauvegarder les infos utilisateur en local si besoin
          // await AsyncStorage.setItem('koosy_user', JSON.stringify(user));
          setIsLoggedIn(true);
        } catch (err) {
          // Si erreur 401, forcer la déconnexion
          setIsLoggedIn(false);
          await clearSession();
        }
      } else {
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SplashScreen />;

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
                        {/* Auth flow */}
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
                              const sess = await getSession();
                              if (sess?.token && sess?.email === email) {
                                setShowWelcomeLogin(true);
                              } else {
                                const token = generateToken();
                                await saveSession(email || '', token);
                                setShowWelcomeLogin(true);
                              }
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
                                              await clearSession();
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

