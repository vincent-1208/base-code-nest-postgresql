import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../../src/modules/users/users.service';
import { UserRepository } from '../../../../src/modules/users/user.repository';
import { User } from '../../../../src/modules/users/user.entity';

const mockUserRepository = {
  findByEmail: jest.fn(),
  findByName: jest.fn(),
  findById: jest.fn(),
  createAndSave: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: typeof mockUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<typeof mockUserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: 1, email: 'test@example.com' } as User;
      repository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null if not found', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');
      expect(result).toBeNull();
      expect(repository.findByEmail).toHaveBeenCalledWith('notfound@example.com');
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const userData = { email: 'new@example.com', password: 'password' };
      const savedUser = { id: 1, ...userData } as User;
      repository.createAndSave.mockResolvedValue(savedUser);

      const result = await service.create(userData);
      expect(result).toEqual(savedUser);
      expect(repository.createAndSave).toHaveBeenCalledWith(userData);
    });
  });
});
