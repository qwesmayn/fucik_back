import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async me() {
    const user = this.request['user'];
    return this.userRepository.findOne({ where: { id: user.sub } });
  }

  async signIn(username: string, password: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(username: string, password: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user) {
      throw new BadRequestException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      username,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(newUser);
    const token = await this.jwtService.signAsync({
      sub: savedUser.id,
      username: savedUser.username,
    });
    return {
      access_token: token,
      user: {
        id: savedUser.id,
        username: savedUser.username
      }
    };
  }
}
