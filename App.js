import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './src/Navigation/StackNavigation/StackNavigation';
import { useFonts } from "@use-expo/font";
import {
  en,
  nl,
  de,
  pl,
  pt,
  enGB,
  registerTranslation,
} from 'react-native-paper-dates'
registerTranslation('en', en)
registerTranslation('nl', nl)
registerTranslation('pl', pl)
registerTranslation('pt', pt)
registerTranslation('de', de)
registerTranslation('en-GB', enGB)


const customFonts = {
  OpenSansCondensedBold: require("./assets/Fonts/OpenSansCondensed-Bold.ttf"),
  OpenSansCondensedLight: require("./assets/Fonts/OpenSansCondensed-Light.ttf"),
  OpenSansCondensedLightItalic:require("./assets/Fonts/OpenSansCondensed-LightItalic.ttf"),
};

export default function App() {
  
  const [isLoaded] = useFonts(customFonts);
  

  if (!isLoaded) {
    return null;
  }
  else{
    return (
      
        <PaperProvider>
          <NavigationContainer>
            <StackNavigation/>
          </NavigationContainer>
        </PaperProvider>
    );
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
