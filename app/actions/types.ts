export interface ActionResponse<T = any> {
  errors: number;
  success: number;
  message: string;
  body: T;
}

export function createActionResponse<T>(errors: number, success: number, message: string, body: T): ActionResponse<T> {
  return {
    errors,
    success,
    message,
    body,
  };
}

export function createErrorResponse<T>(message: string, body: T): ActionResponse<T> {
  return createActionResponse(1, 0, message, body);
}

export function createSuccessResponse<T>(message: string, body: T): ActionResponse<T> {
  return createActionResponse(0, 1, message, body);
}
