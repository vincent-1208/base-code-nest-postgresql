import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly userRepo: UserRepository) {}

  findByEmail(email: string) {
    return this.userRepo.findByEmail(email);
  }

  findByName(name: string) {
    return this.userRepo.findByName(name);
  }

  findById(id: number) {
    return this.userRepo.findById(id);
  }

  async create(data: Partial<User>) {
    return this.userRepo.createAndSave(data);
  }

  async setRefreshToken(userId: number, hashedToken: string) {
    await this.userRepo.updateRefreshToken(userId, hashedToken);
  }

  async removeRefreshToken(userId: number) {
    await this.userRepo.clearRefreshToken(userId);
  }

  async findByRefreshToken(refreshToken: string) {
    return this.userRepo.findByRefreshToken(refreshToken);
  }
}
