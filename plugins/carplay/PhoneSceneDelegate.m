#import "PhoneSceneDelegate.h"
 
@implementation PhoneSceneDelegate

- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions {
  AppDelegate *appDelegate = (AppDelegate *)UIApplication.sharedApplication.delegate;
  UIWindowScene *windowScene = (UIWindowScene *)scene;
  UIViewController *rootViewController = [[UIViewController alloc] init];
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:appDelegate.bridge
                                                  moduleName:@"main"
                                           initialProperties:nil];
  rootViewController.view = rootView;
  UIWindow *window = [[UIWindow alloc] initWithWindowScene:windowScene];
  window.rootViewController = rootViewController;
  self.window = window;
  [window makeKeyAndVisible];
}
 
@end
