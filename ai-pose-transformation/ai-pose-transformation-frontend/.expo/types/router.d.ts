/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/_sitemap` | `/screens/CameraScreen` | `/screens/HistoryScreen` | `/screens/HomeScreen` | `/screens/LoginScreen` | `/screens/RegisterScreen` | `/screens/SessionSummaryScreen`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
