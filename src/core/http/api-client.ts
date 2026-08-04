import type { APIRequestContext } from "@playwright/test";
import { performance } from "node:perf_hooks";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | "TRACE";
export type AuthenticationMode = "auto" | "none" | "invalid";
type FetchOptions = NonNullable<Parameters<APIRequestContext["fetch"]>[1]>;

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
  multipart?: Record<string, unknown>;
  headers?: Record<string, string>;
  auth?: AuthenticationMode;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  status: number;
  ok: boolean;
  url: string;
  headers: Record<string, string>;
  body: T;
  text: string;
  durationMs: number;
}

export class ApiClient {
  public constructor(
    private readonly context: APIRequestContext,
    private readonly apiKey?: string,
  ) {}

  public get<T = unknown>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>("GET", path, options);
  }

  public post<T = unknown>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>("POST", path, options);
  }

  public patch<T = unknown>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", path, options);
  }

  public delete<T = unknown>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", path, options);
  }

  public async request<T = unknown>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = { ...options.headers };
    const auth = options.auth ?? "auto";

    if (auth === "invalid") {
      headers["x-api-key"] = "invalid-api-key-for-negative-test";
    } else if (auth === "auto" && this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }

    const fetchOptions: FetchOptions = {
      method,
      headers,
      failOnStatusCode: false,
    };
    const params = removeUndefined(options.params);

    if (params) {
      fetchOptions.params = params;
    }
    if (options.data !== undefined) {
      fetchOptions.data = options.data;
    }
    if (options.multipart !== undefined) {
      fetchOptions.multipart = options.multipart as NonNullable<FetchOptions["multipart"]>;
    }
    if (options.timeout !== undefined) {
      fetchOptions.timeout = options.timeout;
    }

    const startedAt = performance.now();
    const response = await this.context.fetch(path, fetchOptions);
    const durationMs = performance.now() - startedAt;
    const text = await response.text();

    return {
      status: response.status(),
      ok: response.ok(),
      url: response.url(),
      headers: response.headers(),
      body: parseBody<T>(text),
      text,
      durationMs,
    };
  }
}

function removeUndefined(
  values: Record<string, string | number | boolean | undefined> | undefined,
): Record<string, string | number | boolean> | undefined {
  if (!values) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined),
  );
}

function parseBody<T>(text: string): T {
  if (text.length === 0) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}
