// App.js — the root component.
// ---------------------------------------------------------------------------
// Providers wrap the app from the outside in. Each one makes something
// available to every component inside it:
//
//   SafeAreaProvider   → screen insets (notches, status bar, gesture bar)
//   Suspense           → shows <LoadingView> while the database opens
//   SQLiteProvider     → opens the database and runs migrateDbIfNeeded ONCE
//                        before any screen renders; useSQLiteContext() reads it
//   AuthProvider       → who is logged in (useAuth())
//   NavigationContainer→ navigation state for all navigators
// ---------------------------------------------------------------------------

import { Suspense } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import LoadingView from './src/components/LoadingView';
import { AuthProvider } from './src/context/AuthContext';
import { DATABASE_NAME } from './src/config/constants';
import { migrateDbIfNeeded } from './src/database/migrate';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/theme';

const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Suspense fallback={<LoadingView message="Preparing the campus database…" />}>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded} useSuspense>
          <AuthProvider>
            <NavigationContainer theme={navigationTheme}>
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </SQLiteProvider>
      </Suspense>
    </SafeAreaProvider>
  );
}
