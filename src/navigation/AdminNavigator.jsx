import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AdminDashboardScreen,
  ManageGradesScreen,
  GradeInputScreen,
  ProfileScreen,
  AccessDeniedScreen,
} from '../screens';
import { COLORS, FONT_WEIGHTS } from '../constants';

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.light.background },
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="ManageGrades" component={ManageGradesScreen} />
      <Stack.Screen name="GradeInput" component={GradeInputScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccessDenied" component={AccessDeniedScreen} />
    </Stack.Navigator>
  );
}
