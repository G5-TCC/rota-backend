import { Test, TestingModule } from '@nestjs/testing';
import { SessionRepository } from './session.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('SessionRepository', () => {
  let repository: SessionRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionRepository,
        {
          provide: PrismaService,
          useValue: {
            session: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<SessionRepository>(SessionRepository);
    prisma = module.get(PrismaService);
  });

  it('should create a session', async () => {
    const data = {
      userId: 'u1',
      refreshToken: 'r1',
      ipAddress: '127.0.0.1',
      userAgent: 'ua',
      expiresAt: new Date(),
    };
    await repository.create(data);
    expect(prisma.session.create).toHaveBeenCalledWith({ data });
  });

  it('should find session with user', async () => {
    const token = 'r1';
    await repository.findUniqueWithUser(token);
    expect(prisma.session.findUnique).toHaveBeenCalledWith({
      where: { refreshToken: token },
      include: { user: true },
    });
  });

  it('should update a session', async () => {
    const id = 's1';
    const data = { refreshToken: 'r2', expiresAt: new Date() };
    await repository.update(id, data);
    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id },
      data,
    });
  });

  it('should delete many by token', async () => {
    const token = 'r1';
    await repository.deleteManyByToken(token);
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { refreshToken: token },
    });
  });
});
