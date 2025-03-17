import {
  ConfigPlugin,
  IOSConfig,
  XcodeProject,
  createRunOncePlugin,
  withDangerousMod,
  withEntitlementsPlist,
  withInfoPlist,
  withXcodeProject,
} from "expo/config-plugins";

import * as fs from "fs/promises";
import * as path from "path";

let xcodeProjectName = "";

export const withCarPlay: ConfigPlugin = (config) => {
  xcodeProjectName = config.name;

  config = withCarPlayAppDelegateHeader(config);
  config = withCarPlayAppDelegate(config);
  config = withCarPlayInfoPlist(config);
  config = withCarPlayEntitlements(config);

  config = withCarPlayScenesFiles(config);
  config = withCarPlayScenesInProject(config);
  return config;
};

export const withCarPlayAppDelegate: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const fileInfo = IOSConfig.Paths.getAppDelegate(
        config.modRequest.projectRoot,
      );
      let contents = await fs.readFile(fileInfo.path, "utf-8");
      if (fileInfo.language === "objcpp" || fileInfo.language === "objc") {
        contents = await modifySourceFile(
          config.modRequest.projectRoot,
          contents,
        );
      } else {
        throw new Error(
          `Cannot add CarPlay code to AppDelegate of language "${fileInfo.language}"`,
        );
      }
      await fs.writeFile(fileInfo.path, contents);
      return config;
    },
  ]);
};

export const withCarPlayAppDelegateHeader: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const headerFilePath = IOSConfig.Paths.getAppDelegateHeaderFilePath(
        config.modRequest.projectRoot,
      );
      let contents = await fs.readFile(headerFilePath, "utf-8");

      contents = await modifyHeaderFile(
        config.modRequest.projectRoot,
        contents,
      );

      await fs.writeFile(headerFilePath, contents);
      return config;
    },
  ]);
};

const withCarPlayEntitlements: ConfigPlugin = (config) => {
  return withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.developer.carplay-audio"] = true;
    config.modResults["com.apple.developer.carplay-parking"] = true;
    config.modResults["com.apple.developer.carplay-maps"] = true;
    return config;
  });
};

export const withCarPlayInfoPlist: ConfigPlugin = (config) => {
  return withInfoPlist(config, async (config) => {
    const xcodeProject = config.modResults;

    xcodeProject.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: true,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneClassName: "UIWindowScene",
            UISceneConfigurationName: "Phone",
            UISceneDelegateClassName: "PhoneSceneDelegate",
          },
        ],
        CPTemplateApplicationSceneSessionRoleApplication: [
          {
            UISceneClassName: "CPTemplateApplicationScene",
            UISceneConfigurationName: "CarPlay",
            UISceneDelegateClassName: "CarSceneDelegate",
          },
        ],
      },
    };

    return config;
  });
};

const withCarPlayScenesInProject: ConfigPlugin = (config) => {
  return withXcodeProject(config, async (config) => {
    addSourceFileToProject(
      config.modResults,
      xcodeProjectName + "/CarSceneDelegate.h",
    );
    addSourceFileToProject(
      config.modResults,
      xcodeProjectName + "/CarSceneDelegate.m",
    );

    addSourceFileToProject(
      config.modResults,
      xcodeProjectName + "/PhoneSceneDelegate.h",
    );
    addSourceFileToProject(
      config.modResults,
      xcodeProjectName + "/PhoneSceneDelegate.m",
    );

    return config;
  });
};

const withCarPlayScenesFiles: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectPath = IOSConfig.Paths.getAppDelegateHeaderFilePath(
        config.modRequest.projectRoot,
      );

      const dir = path.dirname(projectPath);

      fs.copyFile(
        config.modRequest.projectRoot + "/plugins/carplay/CarSceneDelegate.h",
        path.join(dir, "CarSceneDelegate.h"),
      );
      fs.copyFile(
        config.modRequest.projectRoot + "/plugins/carplay/CarSceneDelegate.m",
        path.join(dir, "CarSceneDelegate.m"),
      );
      fs.copyFile(
        config.modRequest.projectRoot + "/plugins/carplay/PhoneSceneDelegate.h",
        path.join(dir, "PhoneSceneDelegate.h"),
      );
      fs.copyFile(
        config.modRequest.projectRoot + "/plugins/carplay/PhoneSceneDelegate.m",
        path.join(dir, "PhoneSceneDelegate.m"),
      );

      return config;
    },
  ]);
};

const modifyHeaderFile = async (
  projectRoot: string,
  contents: string,
): Promise<string> => {
  const addedContents = await getFileContents(projectRoot, "AppDelegate.add.h");

  contents = contents.replace(
    /@interface AppDelegate\s?:\s?EXAppDelegateWrapper?/,
    (_a, _b) => addedContents,
  );

  return contents;
};

const modifySourceFile = async (
  projectRoot: string,
  contents: string,
): Promise<string> => {
  const bottomAppDelegateMethods = await getFileContents(
    projectRoot,
    "AppDelegate.bottomMethods.mm",
  );

  contents = contents.replace("@end", bottomAppDelegateMethods);

  contents = contents.replace(
    "self.initialProps = @{};",
    "self.initialProps = @{};\n  self.bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];",
  );

  return contents;
};

const getFileContents = async (
  projectRoot: string,
  fileName: string,
): Promise<string> => {
  return await fs.readFile(
    projectRoot + "/plugins/carplay/" + fileName,
    "utf-8",
  );
};

const addSourceFileToProject = (proj: XcodeProject, file: string) => {
  const targetUuid = proj.findTargetKey(xcodeProjectName);

  const groupUuid = proj.findPBXGroupKey({ name: xcodeProjectName });

  if (!targetUuid) {
    console.error(`Failed to find "${xcodeProjectName}" target!`);
    return;
  }
  if (!groupUuid) {
    console.error(`Failed to find "${xcodeProjectName}" group!`);
    return;
  }

  proj.addSourceFile(
    file,
    {
      target: targetUuid,
    },
    groupUuid,
  );
};

const withCarPlayPlugin: ConfigPlugin = (config) => {
  config = withCarPlay(config);
  return config;
};

export default createRunOncePlugin(
  withCarPlayPlugin,
  "@KMalkowski/react-native-carplay",
  "0.0.1",
);
