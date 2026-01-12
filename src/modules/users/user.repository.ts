import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findByName(name: string) {
    return this.repo.findOne({ where: { user_name: name } });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async createAndSave(data: Partial<User>) {
    const u = this.repo.create(data);
    return this.repo.save(u);
  }

  async updateRefreshToken(userId: number, hashedToken: string) {
    await this.repo.update(userId, { hashedRefreshToken: hashedToken });
  }

  async clearRefreshToken(userId: number) {
    await this.repo.update(userId, { hashedRefreshToken: undefined });
  }

  // find user by comparing provided refresh token with stored hash
  async findByRefreshToken(refreshToken: string) {
    const users = await this.repo.find({
      where: { hashedRefreshToken: Not(IsNull()) },
    });
    for (const u of users) {
      if (!u.hashedRefreshToken) continue;
      const match = await bcrypt.compare(refreshToken, u.hashedRefreshToken);
      if (match) return u;
    }
    return undefined;
  }
}
