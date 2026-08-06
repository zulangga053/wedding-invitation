import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Section } from '@momentia/shared';
import { type SectionRepository } from './section.repository';
import { SectionsService } from './sections.service';

const user = { uid: 'uid-1' };

describe('SectionsService', () => {
  let repo: jest.Mocked<SectionRepository>;
  let service: SectionsService;

  beforeEach(() => {
    repo = {
      listForEvent: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      create: jest.fn((_t, _e, s) => Promise.resolve(s)),
      update: jest.fn(),
      remove: jest.fn(),
      replaceOrder: jest.fn(),
    } as jest.Mocked<SectionRepository>;
    service = new SectionsService(repo);
  });

  it('creates a section with auto-incremented order', async () => {
    repo.listForEvent.mockResolvedValue([]);
    const section = await service.create(user, 't1', 'e1', {
      blockType: 'hero',
      data: { title: 'Zul & Angga' },
    });

    expect(section.order).toBe(0);
    expect(section.enabled).toBe(true);
    expect(section.schemaVersion).toBe(1);
    expect(repo.create).toHaveBeenCalledWith(
      't1',
      'e1',
      expect.objectContaining({ blockType: 'hero' }),
    );
  });

  it('rejects changing blockType on update', async () => {
    repo.findById.mockResolvedValue({
      id: 's1',
      blockType: 'hero',
      schemaVersion: 1,
    } as Section);

    await expect(
      service.updateData('t-1', 'e', 's1', {
        blockType: 'faq',
        data: { items: [] },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFound when patching a missing section', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(
      service.patch('t-1', 'e', 'gone', { enabled: false }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('validates reorder covers every section exactly once', async () => {
    repo.listForEvent.mockResolvedValue([
      { id: 'a', order: 0 } as Section,
      { id: 'b', order: 1 } as Section,
    ]);

    await expect(service.reorder('t-1', 'e', ['a'])).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await service.reorder('t-1', 'e', ['b', 'a']);
    expect(repo.replaceOrder).toHaveBeenCalledWith('t-1', 'e', ['b', 'a']);
  });
});
