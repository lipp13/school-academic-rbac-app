import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  GuruDashboardScreen,
  GradeInputScreen,
  GuruScheduleScreen,
  ProfileScreen,
  AccessDeniedScreen,
} from '../screens';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator();

export default function GuruNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.light.background },
      }}
    >
      <Stack.Screen name="GuruDashboard" component={GuruDashboardScreen} />
      <Stack.Screen name="GradeInput" component={GradeInputScreen} />
      <Stack.Screen name="GuruSchedule" component={GuruScheduleScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccessDenied" component={AccessDeniedScreen} />
    </Stack.Navigator>
  );
}
