export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export function successResponse<T>(
  data: T,
  message: string = 'success',
): ApiResponse<T> {
  return {
    code: 200,
    message,
    data,
  };
}

export function errorResponse(
  code: number,
  message: string,
): ApiResponse<null> {
  return {
    code,
    message,
    data: null,
  };
}
