- (UISceneConfiguration *)application:(UIApplication *)application configurationForConnectingSceneSession:(UISceneSession *)connectingSceneSession options:(UISceneConnectionOptions *)options {
    NSLog(@"AppDelegate: Configuring scene for role: %@", connectingSceneSession.role);
    if ([connectingSceneSession.role isEqualToString:UIWindowSceneSessionRoleApplication]) {
        return [[UISceneConfiguration alloc] initWithName:@"Phone" sessionRole:connectingSceneSession.role];
    }
    if ([connectingSceneSession.role isEqualToString:@"CPTemplateApplicationSceneSessionRoleApplication"]) {
        return [[UISceneConfiguration alloc] initWithName:@"CarPlay" sessionRole:connectingSceneSession.role];
    }
    return [[UISceneConfiguration alloc] initWithName:@"Default Configuration" sessionRole:connectingSceneSession.role];
}

@end
