#import "CarSceneDelegate.h"
#import "RNCarPlay.h"

@implementation CarSceneDelegate

- (void)templateApplicationScene:
            (CPTemplateApplicationScene *)templateApplicationScene
    didConnectInterfaceController:(CPInterfaceController *)interfaceController {
  NSLog(@"CarSceneDelegate: Connected to CarPlay");
  [RNCarPlay connectWithInterfaceController:interfaceController
                                     window:templateApplicationScene.carWindow];
}

- (void)templateApplicationScene:
            (CPTemplateApplicationScene *)templateApplicationScene
    didDisconnectInterfaceController:
        (CPInterfaceController *)interfaceController {
  NSLog(@"CarSceneDelegate: Disconnected from CarPlay");
  [RNCarPlay disconnect];
}

@end
