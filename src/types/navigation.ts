import { Recipe } from '../types';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Form: { recipe?: Recipe; isDuplicate?: boolean };
  Detail: { recipeId: string };
  Profile: undefined;
};
