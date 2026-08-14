declare module "@vercel/node" {
  export interface VercelRequest {
    method?: string;
    headers: Record<string, string | string[] | undefined>;
    body?: any;
    query: Record<string, string | string[] | undefined>;
    cookies?: Record<string, string>;
    socket: { remoteAddress?: string };
  }

  export interface VercelResponse {
    status(code: number): VercelResponse;
    json(value: any): VercelResponse;
    setHeader(name: string, value: string | number | readonly string[]): void;
    end(value?: any): void;
  }
}

declare module "crypto" {
  const crypto: any;
  export default crypto;
}

declare const process: {
  env: Record<string, string | undefined>;
};

declare const Buffer: any;