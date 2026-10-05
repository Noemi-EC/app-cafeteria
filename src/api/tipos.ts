export interface RespuestaApi<T> {
  status: number;
  message: string;
  data: T;
}
