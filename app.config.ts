// using ts-node/register allows us to write the plugin is Typescirpt without the need to compile it to JS by hand 
require("ts-node/register");
import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  ...,  
  newArchEnabled: false,
  plugins: [
    require("./plugins/carplay/withCarPlay").withCarPlay,
  ],
};

export default config;
