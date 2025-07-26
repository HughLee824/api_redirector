export interface ProxyRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
}

export interface ProxyResponse {
  status: number;
  headers: Record<string, string>;
  data: any;
}

export interface ProxyService {
  name: string;
  baseUrl: string;
  transformRequest(req: ProxyRequest): ProxyRequest;
  transformResponse(res: ProxyResponse): ProxyResponse;
  proxy(req: ProxyRequest): Promise<ProxyResponse>;
} 