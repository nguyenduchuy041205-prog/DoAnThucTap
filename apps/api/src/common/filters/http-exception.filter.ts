import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const request = context.getRequest<Request>()
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const body = exception instanceof HttpException ? exception.getResponse() : undefined

    if (body && typeof body === 'object') {
      const payload = body as Record<string, unknown>
      response.status(status).json({
        code: payload.code ?? (status === 422 ? 'UNPROCESSABLE_ENTITY' : 'HTTP_ERROR'),
        message: payload.message ?? 'Yêu cầu không thể xử lý.',
        ...(payload.details ? { details: payload.details } : {}),
        ...(payload.blockedBy ? { blockedBy: payload.blockedBy } : {}),
        path: request.url,
        timestamp: new Date().toISOString(),
      })
      return
    }

    response.status(status).json({
      code: 'HTTP_ERROR',
      message: typeof body === 'string' ? body : 'Đã xảy ra lỗi máy chủ.',
      path: request.url,
      timestamp: new Date().toISOString(),
    })
  }
}
