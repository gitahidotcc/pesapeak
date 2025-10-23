import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import "./global.css";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-3xl font-bold text-foreground mb-4">
        Welcome to PesaPeak!
      </Text>
      <Text className="text-lg text-muted-foreground">
        Your mobile app is ready to go 🚀
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
