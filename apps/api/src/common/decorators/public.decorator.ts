import { SetMetadata, type ExecutionContext } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marks a route as publicly accessible (skips the global AuthGuard). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export function isPublic(context: ExecutionContext): boolean {
  const handler = Reflect.getMetadata(IS_PUBLIC_KEY, context.getHandler());
  if (handler !== undefined) return handler;
  return Reflect.getMetadata(IS_PUBLIC_KEY, context.getClass()) === true;
}
