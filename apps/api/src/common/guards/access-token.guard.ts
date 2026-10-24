import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const handler = context.getHandler();
        const controller = context.getClass();

        // Check if this is the refresh endpoint in AuthController
        const isRefreshEndpoint = controller.name === 'AuthController' && handler.name === 'refresh';

        if (isRefreshEndpoint) {
            console.log(`🔄 Access Token Guard: Skipping refresh endpoint - Controller: ${controller.name}, Handler: ${handler.name}`);
            console.log(`🔄 Refresh Token Guard will handle authentication for this endpoint`);
            return true;
        }

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            handler,
            controller,
        ]);

        console.log(`🔍 Access Token Guard Check - Controller: ${controller.name}, Handler: ${handler.name}, isPublic: ${isPublic}`);
        console.log(`🔍 Authorization Header: ${request.headers.authorization ? 'Present' : 'Missing'}`);
        console.log(`🔍 Request Method: ${request.method}, URL: ${request.url}`);

        if (isPublic) {
            console.log(`✅ Endpoint is public, bypassing access token validation`);
            return true;
        }

        console.log(`🔒 Endpoint requires authentication, proceeding with access token validation`);
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, _info: any, _context: ExecutionContext) {
        if (err || !user) {
            throw (
                err || new UnauthorizedException('Access token is invalid or expired')
            );
        }
        return user;
    }
}