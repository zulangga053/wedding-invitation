import {
  Injectable,
  type PipeTransform,
  type ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import type { z, ZodType } from 'zod';

/**
 * Validates request payloads against a zod schema at the API boundary.
 * Usage: `@Body(new ZodPipe(RsvpCreateSchema))`.
 */
@Injectable()
export class ZodPipe<T extends ZodType> implements PipeTransform<
  unknown,
  z.infer<T>
> {
  constructor(private readonly schema: T) {}

  transform(value: unknown, _metadata?: ArgumentMetadata): z.infer<T> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    return result.data;
  }
}
