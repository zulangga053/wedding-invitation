import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Section, SectionInput } from '@momentia/shared';
import {
  SECTION_REPOSITORY,
  type SectionRepository,
  type SectionPatch,
} from './section.repository';
import type { AuthenticatedUser } from '../../common/decorators';

@Injectable()
export class SectionsService {
  constructor(
    @Inject(SECTION_REPOSITORY) private readonly repository: SectionRepository,
  ) {}

  async list(tenantId: string, eventId: string): Promise<Section[]> {
    return this.repository.listForEvent(tenantId, eventId);
  }

  /** Public-facing list: only enabled sections, in display order. */
  async listEnabled(tenantId: string, eventId: string): Promise<Section[]> {
    const sections = await this.repository.listForEvent(tenantId, eventId);
    return sections.filter((section) => section.enabled);
  }

  async create(
    _user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
    input: SectionInput,
  ): Promise<Section> {
    const existing = await this.repository.listForEvent(tenantId, eventId);
    const section: Section = {
      id: randomUUID(),
      tenantId,
      eventId,
      blockType: input.blockType,
      data: input.data,
      schemaVersion: 1,
      order: existing.length,
      enabled: true,
    };
    return this.repository.create(tenantId, eventId, section);
  }

  async updateData(
    tenantId: string,
    eventId: string,
    sectionId: string,
    input: SectionInput,
  ): Promise<Section> {
    const existing = await this.repository.findById(
      tenantId,
      eventId,
      sectionId,
    );
    if (!existing)
      throw new NotFoundException(`Section ${sectionId} not found`);
    if (existing.blockType !== input.blockType) {
      throw new BadRequestException(
        'blockType cannot change on an existing section',
      );
    }
    const updated = await this.repository.update(tenantId, eventId, sectionId, {
      data: input.data,
      schemaVersion: existing.schemaVersion + 1,
    });
    if (!updated) throw new NotFoundException(`Section ${sectionId} not found`);
    return updated;
  }

  async patch(
    tenantId: string,
    eventId: string,
    sectionId: string,
    patch: SectionPatch,
  ): Promise<Section> {
    const updated = await this.repository.update(
      tenantId,
      eventId,
      sectionId,
      patch,
    );
    if (!updated) throw new NotFoundException(`Section ${sectionId} not found`);
    return updated;
  }

  async reorder(
    tenantId: string,
    eventId: string,
    orderedIds: string[],
  ): Promise<void> {
    if (orderedIds.length === 0)
      throw new BadRequestException('Order list cannot be empty');
    const current = await this.repository.listForEvent(tenantId, eventId);
    const currentIds = new Set(current.map((s) => s.id));
    const allMatch =
      orderedIds.length === current.length &&
      orderedIds.every((id) => currentIds.has(id));
    if (!allMatch)
      throw new BadRequestException(
        'Order list must contain every section exactly once',
      );
    await this.repository.replaceOrder(tenantId, eventId, orderedIds);
  }

  async remove(
    tenantId: string,
    eventId: string,
    sectionId: string,
  ): Promise<void> {
    await this.repository.remove(tenantId, eventId, sectionId);
  }
}
