import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'src/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RefreshToken } from './entities/refresh.entity';
import { AccountRepository } from './repos/account.repository';
import { RefreshRepository } from './repos/refresh.repository';
import { RefreshJwtStrategy } from 'src/strategies/refresh.strategy';
import { JwtStrategy } from 'src/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, RefreshToken]),
    PassportModule,
    JwtModule.register({
      secret: env.jwt.secret,
      signOptions: { expiresIn: env.jwt.time },
    }),
  ],
  controllers: [UserController, AdminController],
  providers: [
    UserService,
    AdminService,
    AccountRepository,
    RefreshRepository,
    JwtStrategy,
    RefreshJwtStrategy,
  ],
})
export class AuthModule {}
