import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  Event,
  EventCreateInput,
  EventUpdateInput,
} from '@momentia/shared';
import { AuditService } from '../audit/audit.service';
import {
  EventSlugTakenError,
  EVENT_REPOSITORY,
  type EventRepository,
} from './event.repository';
import {
  READ_MODEL_SERVICE,
  type ReadModelService,
} from './read-model.service';
import type { AuthenticatedUser } from '../../common/decorators';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly repository: EventRepository,
    @Inject(READ_MODEL_SERVICE) private readonly readModel: ReadModelService,
    private readonly audit: AuditService,
  ) {}

  async list(tenantId: string): Promise<Event[]> {
    return this.repository.list(tenantId);
  }

  async getById(tenantId: string, eventId: string): Promise<Event> {
    const event = await this.repository.findById(tenantId, eventId);
    if (!event) throw new NotFoundException(`Event ${eventId} not found`);
    return event;
  }

  async create(
    user: AuthenticatedUser,
    tenantId: string,
    input: EventCreateInput,
  ): Promise<Event> {
    const now = new Date().toISOString();
    const event: Event = {
      id: randomUUID(),
      tenantId,
      type: input.type,
      slug: input.slug,
      name: input.name,
      status: 'draft',
      hosts: input.hosts ?? [],
      mainDate: input.mainDate,
      language: input.language,
      themeId: input.themeId,
      music: input.music,
      stream: input.stream,
      hero: input.hero,
      seo: input.seo,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.repository.create(tenantId, event);
    } catch (err) {
      if (err instanceof EventSlugTakenError) {
        throw new ConflictException(
          `Invitation slug "${input.slug}" is already in use`,
        );
      }
      throw err;
    }

    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'event.create',
      targetId: event.id,
    });

    return event;
  }

  async update(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
    input: EventUpdateInput,
  ): Promise<Event> {
    const event = await this.repository.update(tenantId, eventId, input);
    if (!event) throw new NotFoundException(`Event ${eventId} not found`);

    if (event.status === 'published') {
      await this.readModel.rebuild(event);
    }

    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'event.update',
      targetId: eventId,
    });

    return event;
  }

  async publish(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
  ): Promise<Event> {
    const event = await this.repository.setStatus(
      tenantId,
      eventId,
      'published',
    );
    if (!event) throw new NotFoundException(`Event ${eventId} not found`);

    await this.readModel.rebuild(event);

    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'event.publish',
      targetId: eventId,
    });

    return event;
  }

  async unpublish(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
  ): Promise<Event> {
    const event = await this.repository.setStatus(tenantId, eventId, 'draft');
    if (!event) throw new NotFoundException(`Event ${eventId} not found`);

    await this.readModel.remove(event.slug);

    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'event.unpublish',
      targetId: eventId,
    });

    return event;
  }

  async remove(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
  ): Promise<void> {
    const event = await this.getById(tenantId, eventId);
    await this.readModel.remove(event.slug);
    await this.repository.remove(tenantId, eventId);

    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'event.delete',
      targetId: eventId,
    });
  }
}
