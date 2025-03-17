@interface AppDelegate : EXAppDelegateWrapper

- (UISceneConfiguration *)application:(UIApplication *)application
    configurationForConnectingSceneSession:
        (UISceneSession *)connectingSceneSession
                                   options:(UISceneConnectionOptions *)options;

@property(nonatomic, strong) RCTBridge *bridge;
