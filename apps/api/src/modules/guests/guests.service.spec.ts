import { AuditService } from '../audit/audit.service';
import { type GuestRepository } from './guest.repository';
import { GuestsService } from './guests.service';

describe('GuestsService', () => {
  const user = { uid: 'uid-1' };
  let repo: jest.Mocked<GuestRepository>;
  let audit: jest.Mocked<Pick<AuditService, 'log'>>;
  let service: GuestsService;

  beforeEach(() => {
    repo = {
      list: jest.fn(),
      findById: jest.fn(),
      create: jest.fn((_t, _e, g) => Promise.resolve(g)),
      update: jest.fn(),
      remove: jest.fn(),
      bulkCreate: jest.fn().mockResolvedValue(0),
    } as jest.Mocked<GuestRepository>;
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    service = new GuestsService(repo, audit as unknown as AuditService);
  });

  it('creates a guest with pending attendance and empty check-in', async () => {
    const guest = await service.create(user, 't1', 'e1', {
      name: 'Budi Santoso',
      tags: [],
    });
    expect(guest.attendance).toBe('pending');
    expect(guest.checkIn).toEqual({ status: false, at: null });
    expect(guest.tenantId).toBe('t1');
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'guest.create' }),
    );
  });

  it('imports rows in bulk', async () => {
    repo.bulkCreate.mockResolvedValue(2);
    const result = await service.importRows(user, 't1', 'e1', [
      { name: 'A' },
      { name: 'B' },
    ] as never);
    expect(result.imported).toBe(2);
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'guest.import',
        meta: { imported: 2 },
      }),
    );
  });

  it('checks a guest in (attendance yes)', async () => {
    repo.update.mockResolvedValue({
      id: 'g1',
      attendance: 'yes',
      checkIn: { status: true, at: '2026-08-06T00:00:00.000Z', by: 'uid-1' },
    } as never);
    const guest = await service.checkIn(user, 't1', 'e1', 'g1');
    expect(guest.attendance).toBe('yes');
    expect(repo.update).toHaveBeenCalledWith(
      't1',
      'e1',
      'g1',
      expect.objectContaining({
        attendance: 'yes',
        checkIn: expect.objectContaining({ status: true, by: 'uid-1' }),
      }),
    );
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'guest.checkin' }),
    );
  });
});
