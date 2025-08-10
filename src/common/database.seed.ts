import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    try {
      const existingAdmin = await this.userRepository.findOne({
        where: { username: 'Admin' }
      });

      if (existingAdmin) {
        this.logger.log('Админский пользователь уже существует');
        return;
      }

      const adminPassword = 'qweasdzxcgt12';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const adminUser = this.userRepository.create({
        username: 'Admin',
        password: hashedPassword,
      });

      await this.userRepository.save(adminUser);

      this.logger.log(`
        ✅ Админский пользователь создан:
        👤 Username: Admin
        🔑 Password: qweasdzxcgt12
        ⚠️  Рекомендуется изменить пароль после первого входа
      `);
    } catch (error) {
      this.logger.error('Ошибка при создании админского пользователя:', error);
    }
  }
}
