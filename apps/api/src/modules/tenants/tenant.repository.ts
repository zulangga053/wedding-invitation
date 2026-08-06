import { Injectable, Logger } from '@nestjs/common';
import type { Tenant, TenantUpdateInput } from '@momentia/shared';
import { FirebaseAdminService } from '../../database/firebase-admin.service';
import type { Member } from '@momentia/shared';

export class SlugTakenError extends Error {
  constructor(slug: string) {
    super(`Slug already taken: ${slug}`);
    this.name = 'SlugTakenError';
  }
}

export const TENANT_REPOSITORY = Symbol('TENANT_REPOSITORY');

export interface TenantRepository {
  create(tenant: Tenant): Promise<Tenant>;
  findById(id: string): Promise<Tenant | null>;
  findBySlug(slug: string): Promise<Tenant | null>;
  listForUser(uid: string): Promise<Tenant[]>;
  listAll(limit: number): Promise<Tenant[]>;
  update(id: string, input: TenantUpdateInput): Promise<Tenant | null>;
  deactivate(id: string): Promise<Tenant | null>;
  setStatus(id: string, status: Tenant['status']): Promise<Tenant | null>;
  addMember(tenantId: string, member: Member): Promise<void>;
}

@Injectable()
export class FirestoreTenantRepository implements TenantRepository {
  private readonly logger = new Logger(FirestoreTenantRepository.name);

  constructor(private readonly firebase: FirebaseAdminService) {}

  private get db() {
    return this.firebase.firestore;
  }

  async create(tenant: Tenant): Promise<Tenant> {
    const tenantRef = this.db.doc(`tenants/${tenant.id}`);
    const slugRef = this.db.doc(`reserved-slugs/${tenant.slug}`);

    await this.db.runTransaction(async (tx) => {
      const existing = await tx.get(slugRef);
      if (existing.exists) {
        throw new SlugTakenError(tenant.slug);
      }
      // Clean up undefined values before saving to Firestore
      const cleanTenant = Object.fromEntries(
        Object.entries(tenant).filter(([_, value]) => value !== undefined),
      );
      tx.set(tenantRef, cleanTenant);
      tx.set(slugRef, {
        slug: tenant.slug,
        tenantId: tenant.id,
        claimedAt: tenant.createdAt,
      });
    });

    return tenant;
  }

  async findById(id: string): Promise<Tenant | null> {
    const snap = await this.db.doc(`tenants/${id}`).get();
    return snap.exists ? (snap.data() as Tenant) : null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const snap = await this.db.doc(`reserved-slugs/${slug}`).get();
    if (!snap.exists) return null;
    const data = snap.data() as { tenantId?: string };
    if (!data.tenantId) return null;
    return this.findById(data.tenantId);
  }

  async listForUser(uid: string): Promise<Tenant[]> {
    const memberSnaps = await this.db
      .collectionGroup('members')
      .where('uid', '==', uid)
      .limit(100)
      .get();

    const tenants = await Promise.all(
      memberSnaps.docs.map((doc) => {
        const tenantId = doc.ref.path.split('/')[1];
        return tenantId ? this.findById(tenantId) : Promise.resolve(null);
      }),
    );

    return tenants.filter((t): t is Tenant => t !== null);
  }

  async listAll(limit: number): Promise<Tenant[]> {
    const snap = await this.db
      .collection('tenants')
      .orderBy('createdAt', 'desc')
      .limit(Math.min(limit, 1000))
      .get();
    return snap.docs.map((doc) => doc.data() as Tenant);
  }

  async update(id: string, input: TenantUpdateInput): Promise<Tenant | null> {
    const ref = this.db.doc(`tenants/${id}`);
    const current = await ref.get();
    if (!current.exists) return null;

    // Clean up undefined values from input before updating
    const cleanInput = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value !== undefined),
    );
    await ref.update({
      ...cleanInput,
      settings: input.settings
        ? { ...((current.data() as Tenant).settings ?? {}), ...input.settings }
        : undefined,
      updatedAt: new Date().toISOString(),
    });

    const updated = await ref.get();
    return updated.data() as Tenant;
  }

  async addMember(tenantId: string, member: Member): Promise<void> {
    // Clean up undefined values before saving to Firestore
    const cleanMember = Object.fromEntries(
      Object.entries(member).filter(([_, value]) => value !== undefined),
    );
    await this.db
      .doc(`tenants/${tenantId}/members/${member.uid}`)
      .set(cleanMember);
  }

  async deactivate(id: string): Promise<Tenant | null> {
    return this.setStatus(id, 'suspended');
  }

  async setStatus(
    id: string,
    status: Tenant['status'],
  ): Promise<Tenant | null> {
    const ref = this.db.doc(`tenants/${id}`);
    const current = await ref.get();
    if (!current.exists) return null;
    await ref.update({ status, updatedAt: new Date().toISOString() });
    const updated = await ref.get();
    return updated.data() as Tenant;
  }
}
