import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

export type RootStackParamList = {
  Main: undefined;
  Details: { movieId: number };
  TvDetails: { tvId: number };
  Player: { streamUrl: string; title: string };
  Login: undefined;
  SignUp: undefined;
  UpdateRequired: undefined; // <-- Add this line
  GenreDetails: { genreId: number; genreName: string };
  // <-- Add this line
};

// This defines the screens that are part of your bottom tab navigator
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  MyList: undefined;
  Profile: undefined;
};

// Type for the navigation prop on any screen in the stack
export type AppNavigationProp = StackNavigationProp<RootStackParamList>;

// Type for the route prop on the Details screen
export type DetailsScreenRouteProp = RouteProp<RootStackParamList, "Details">;
