import { Test, TestingModule } from '@nestjs/testing';
import { DeviceMonitorService } from './device-monitor.service';
import { UserRepository } from '../../users/repositories/user.repository';

describe('DeviceMonitorService', () => {
  let service: DeviceMonitorService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceMonitorService,
        {
          provide: UserRepository,
          useValue: {
            findKnownDevice: jest.fn(),
            createKnownDevice: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DeviceMonitorService>(DeviceMonitorService);
    userRepository = module.get(UserRepository);
  });

  it('should return true if device is unknown', async () => {
    userRepository.findKnownDevice.mockResolvedValue(null);
    const result = await service.isNewDevice('user-id', 'agent-string');
    expect(result).toBe(true);
    expect(userRepository.findKnownDevice).toHaveBeenCalled();
  });

  it('should return false if device is known', async () => {
    userRepository.findKnownDevice.mockResolvedValue({
      id: 'device-id',
    } as any);
    const result = await service.isNewDevice('user-id', 'agent-string');
    expect(result).toBe(false);
  });

  it('should call createKnownDevice when logging a device', async () => {
    await service.logDevice('user-id', 'agent-string');
    expect(userRepository.createKnownDevice).toHaveBeenCalled();
  });
});
