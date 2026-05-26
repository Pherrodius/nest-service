export interface JwtPayload {
  sub: number;
  name: string;
  phone: string;
}

export interface AuthUser {
  id: number;
  name: string;
  phone: string;
}
