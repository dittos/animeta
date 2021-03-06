import { createParamDecorator, ExecutionContext, HttpStatus } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ApiException } from 'src/controllers/exceptions';
import { User } from 'src/entities/user.entity';

type CurrentUserDecoratorOptions = {
  required?: boolean;
  staffRequired?: boolean;
}

export const CurrentUser = createParamDecorator(
  (data: CurrentUserDecoratorOptions | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;
    if ((data?.required ?? true) && !user) {
      throw new ApiException("Login required.", HttpStatus.UNAUTHORIZED)
    } else if ((data?.staffRequired ?? false) && user?.is_staff) {
      throw new ApiException("Staff permission required.", HttpStatus.UNAUTHORIZED)
    } else {
      return user
    }
  },
);

export const GqlCurrentUser = createParamDecorator(
  (data: CurrentUserDecoratorOptions | undefined, ctx: ExecutionContext) => {
    const request = GqlExecutionContext.create(ctx).getContext().req;
    const user = request.user as User;
    if ((data?.required ?? true) && !user) {
      throw new ApiException("Login required.", HttpStatus.UNAUTHORIZED)
    } else if ((data?.staffRequired ?? false) && user?.is_staff) {
      throw new ApiException("Staff permission required.", HttpStatus.UNAUTHORIZED)
    } else {
      return user
    }
  },
);
