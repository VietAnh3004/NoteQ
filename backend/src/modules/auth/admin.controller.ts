import {
  Body,
  Controller,
  Delete,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from 'src/decorators/role.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import {ApiBearerAuth, ApiBody, ApiOperation} from '@nestjs/swagger';
import { AuthenDTO } from './dtos/auth.dto';
import { RolesGuard } from 'src/guards/role.guard';

@Controller('auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Register an admin account', description: 'Register a admin account' })
  @ApiBody({
    description: "Admin account credentials for registration",
    type: AuthenDTO,
  })
  @Post('/register-admin')
  async register(@Body() { username, password }: AuthenDTO) {
    await this.adminService.register({ username, password });
    return { message: 'Register successful' };
  }

  @ApiOperation({summary: 'Delete an account', description: 'Delete an account by account_id'})
    @ApiBody({
        description: "Account ID to delete",
        schema: {
            type: 'object',
            properties: {
                account_id: {
                type: 'number',
                example: 1,
                },
            },
        },
    })
  @Delete('/delete-account')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async deleteAccount(@Body() account_id: number) {
    await this.adminService.deleteAccount(account_id);
    return { message: 'Delete user successful' };
  }
}
