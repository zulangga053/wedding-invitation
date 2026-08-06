import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Guest, GuestImportRow, GuestInput } from '@momentia/shared';
import { AuditService } from '../audit/audit.service';
import {
  GUEST_REPOSITORY,
  type GuestFilters,
  type GuestPage,
  type GuestRepository,
} from './guest.repository';
import type { AuthenticatedUser } from '../../common/decorators';

@Injectable()
export class GuestsService {
  constructor(
    @Inject(GUEST_REPOSITORY) private readonly repository: GuestRepository,
    private readonly audit: AuditService,
  ) {}

  list(
    tenantId: string,
    eventId: string,
    filters: GuestFilters,
  ): Promise<GuestPage> {
    return this.repository.list(tenantId, eventId, filters);
  }

  async getById(
    tenantId: string,
    eventId: string,
    guestId: string,
  ): Promise<Guest> {
    const guest = await this.repository.findById(tenantId, eventId, guestId);
    if (!guest) throw new NotFoundException(`Guest ${guestId} not found`);
    return guest;
  }

  async create(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
    input: GuestInput,
  ): Promise<Guest> {
    const now = new Date().toISOString();
    const guest: Guest = {
      id: randomUUID(),
      tenantId,
      eventId,
      name: input.name,
      category: input.category,
      side: input.side,
      phone: input.phone,
      group: input.group,
      tags: input.tags ?? [],
      attendance: 'pending',
      checkIn: { status: false, at: null },
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.create(tenantId, eventId, guest);
    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'guest.create',
      targetId: guest.id,
    });
    return guest;
  }

  async update(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
    guestId: string,
    input: Partial<GuestInput>,
  ): Promise<Guest> {
    const updated = await this.repository.update(tenantId, eventId, guestId, {
      name: input.name,
      category: input.category,
      side: input.side,
      phone: input.phone,
      group: input.group,
      tags: input.tags,
      notes: input.notes,
    });
    if (!updated) throw new NotFoundException(`Guest ${guestId} not found`);
    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'guest.update',
      targetId: guestId,
    });
    return updated;
  }

  async remove(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
    guestId: string,
  ): Promise<void> {
    await this.repository.remove(tenantId, eventId, guestId);
    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'guest.delete',
      targetId: guestId,
    });
  }

  async importRows(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
    rows: GuestImportRow[],
  ): Promise<{ imported: number }> {
    const now = new Date().toISOString();
    const guests: Guest[] = rows.map((row) => ({
      id: randomUUID(),
      tenantId,
      eventId,
      name: row.name,
      category: row.category,
      side: row.side,
      phone: row.phone,
      group: row.group,
      tags: row.tags ?? [],
      attendance: 'pending',
      checkIn: { status: false, at: null },
      notes: row.notes,
      createdAt: now,
      updatedAt: now,
    }));
    const imported = await this.repository.bulkCreate(
      tenantId,
      eventId,
      guests,
    );
    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'guest.import',
      meta: { imported },
    });
    return { imported };
  }

  async exportList(tenantId: string, eventId: string): Promise<Guest[]> {
    const { items } = await this.repository.list(tenantId, eventId, {
      limit: 5000,
    });
    return items;
  }

  async checkIn(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
    guestId: string,
  ): Promise<Guest> {
    const updated = await this.repository.update(tenantId, eventId, guestId, {
      attendance: 'yes',
      checkIn: { status: true, at: new Date().toISOString(), by: user.uid },
    });
    if (!updated) throw new NotFoundException(`Guest ${guestId} not found`);
    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'guest.checkin',
      targetId: guestId,
    });
    return updated;
  }
}
