import { GroupDevicePublicController } from './group-device/group-device-public.controller';
import { GroupDeviceManageController } from './group-device/group-device-manage.controller';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { GroupController } from './group/group.controller';
import { UserController } from './user/user.controller';
import { GroupDeviceController } from './group-device/group-device.controller';
import { ConfigController } from './config/config.controller';
import isAuthenticated = require('../middleware/is-authenticated')

@Module({
  controllers: [
    GroupController,
    UserController,
    GroupDeviceController,
    GroupDevicePublicController,
    GroupDeviceManageController,
    ConfigController
  ],
  imports: [SharedModule]
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(isAuthenticated)
      .forRoutes(ConfigController)
    consumer
      .apply(isAuthenticated)
      .forRoutes(GroupController)
    consumer
      .apply(isAuthenticated)
      .forRoutes(UserController)
    consumer
      .apply(isAuthenticated)
      .forRoutes(GroupDeviceManageController);
  }
}
