import { AuditService } from './audit.service';
import type { AuditEvent } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;
  let collection: jest.Mock;
  let add: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    add = jest.fn().mockResolvedValue(undefined);
    collection = jest.fn(() => ({ add }));
    service = new AuditService(
      {} as any,
      { isConfigured: true, firestore: { collection } } as any,
    );
  });

  const event: AuditEvent = {
    tenantId: 't-1',
    actorUid: 'uid-1',
    action: 'event.publish',
  };

  it('writes to auditLogs collection and returns void', async () => {
    await expect(service.log(event)).resolves.toBeUndefined();
    expect(collection).toHaveBeenCalledWith('auditLogs');
    expect(add).toHaveBeenCalledTimes(1);
    const entry = add.mock.calls[0][0];
    expect(entry.tenantId).toBe('t-1');
    expect(entry.actorUid).toBe('uid-1');
    expect(entry.action).toBe('event.publish');
    expect(entry.timestamp).toEqual(expect.any(String));
  });

  it('skips Firestore write when Firebase is not configured', async () => {
    const s = new AuditService({} as any, { isConfigured: false } as any);
    await expect(s.log(event)).resolves.toBeUndefined();
    expect(collection).not.toHaveBeenCalled();
  });

  it('rejects when the Firestore write fails (returned promise is not caught)', async () => {
    add.mockRejectedValue(new Error('permission-denied'));
    await expect(service.log(event)).rejects.toThrow('permission-denied');
  });
});
