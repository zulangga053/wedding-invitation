import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { EVENT_REPOSITORY } from './event.repository';
import { READ_MODEL_SERVICE } from './read-model.service';
import { AuditService } from '../audit/audit.service';
import type { EventRepository } from './event.repository';
import type { ReadModelService } from './read-model.service';

describe('EventsService', () => {
  let service: EventsService;
  let repo: jest.Mocked<EventRepository>;
  let readModel: jest.Mocked<ReadModelService>;
  let audit: jest.Mocked<AuditService>;

  beforeEach(async () => {
    repo = {
      list: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    readModel = {
      update: jest.fn(),
    } as any;

    audit = {
      log: jest.fn().mockResolvedValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: EVENT_REPOSITORY, useValue: repo },
        { provide: READ_MODEL_SERVICE, useValue: readModel },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list events', async () => {
    const events = [{ id: '1', name: 'Event 1' }];
    repo.list.mockResolvedValue(events as any);
    const result = await service.list('tenant-1');
    expect(result).toBe(events);
    expect(repo.list).toHaveBeenCalledWith('tenant-1');
  });

  it('should get event by id', async () => {
    const event = { id: '1', name: 'Event 1' };
    repo.findById.mockResolvedValue(event as any);
    const result = await service.getById('tenant-1', '1');
    expect(result).toBe(event);
    expect(repo.findById).toHaveBeenCalledWith('tenant-1', '1');
  });
});
