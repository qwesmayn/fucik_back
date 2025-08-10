import { Controller, Post, Body, Get, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UserService } from './user.service';
import { AuthGuard } from 'src/core/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  me() {
    return this.userService.me();
  }

  @Post('sign-in')
  async signIn(
    @Body() body: { username: string, password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.userService.signIn(body.username, body.password);
    
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { message: 'Успешная авторизация' };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return { message: 'Успешный выход' };
  }
}
