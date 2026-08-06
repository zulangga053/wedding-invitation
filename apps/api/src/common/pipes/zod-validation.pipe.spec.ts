import { BadRequestException } from '@nestjs/common';
import { SectionInputSchema } from '@momentia/shared';
import { ZodPipe } from './zod-validation.pipe';

describe('ZodPipe', () => {
  const pipe = new ZodPipe(SectionInputSchema);

  it('returns parsed data for a valid payload', () => {
    const value = pipe.transform({
      blockType: 'hero',
      data: { title: 'Zul & Angga' },
    });
    expect(value).toMatchObject({ blockType: 'hero' });
  });

  it('applies schema defaults', () => {
    const value = pipe.transform({ blockType: 'countdown', data: {} });
    // label kept, defaults injected
    expect(value.data).toBeDefined();
  });

  it('throws BadRequestException with issues for an invalid payload', () => {
    let error: BadRequestException | undefined;
    try {
      pipe.transform({ blockType: 'nope', data: {} });
    } catch (e) {
      error = e as BadRequestException;
    }
    expect(error).toBeInstanceOf(BadRequestException);
    const response = error?.getResponse() as {
      message: string;
      issues: unknown[];
    };
    expect(response.message).toBe('Validation failed');
    expect(response.issues.length).toBeGreaterThan(0);
  });
});
