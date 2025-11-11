import React from 'react';

declare module '@react-navigation/stack' {
  export function createStackNavigator(): any;
}

declare module 'react-hook-form' {
  export function useForm(options?: any): any;
  export function Controller(props: any): React.JSX.Element;
  export type Control = any;
  export type FieldValues = any;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.svg';