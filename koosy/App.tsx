import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/Homescreen';
import LocatairesScreen from './screens/LocatairesScreen';
import BiensScreen from './screens/BiensScreen';
import TachesScreen from './screens/TachesScreen';
import CalendrierScreen from './screens/CalendrierScreen';
import CarteScreen from './screens/CarteScreen';





const Tab = createBottomTabNavigator();

export default function App() {
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
