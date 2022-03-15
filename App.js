import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './src/Navigation/StackNavigation/StackNavigation';
import { useFonts } from "@use-expo/font";


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
