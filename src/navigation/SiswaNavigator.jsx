import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  SiswaDashboardScreen,
  SiswaScheduleScreen,
  ProfileScreen,
  AccessDeniedScreen,
} from '../screens';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator();

export default function SiswaNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.light.background },
      }}
    >
      <Stack.Screen name="SiswaDashboard" component={SiswaDashboardScreen} />
      <Stack.Screen name="SiswaSchedule" component={SiswaScheduleScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccessDenied" component={AccessDeniedScreen} />
    </Stack.Navigator>
  );
}
