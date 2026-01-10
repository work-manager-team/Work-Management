import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  userId: number;
  email: string;
  username: string;
  fullName: string;
}

/**
 * Decorator to get current authenticated user from request
 * Usage: @CurrentUser() user: CurrentUserData
 * Or to get only userId: @CurrentUser('userId') userId: number
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    // If a specific field is requested, return only that field
    return data ? user[data] : user;
  },
);
