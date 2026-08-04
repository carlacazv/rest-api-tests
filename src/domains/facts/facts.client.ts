import type { ApiClient, ApiResponse } from "../../core/http/api-client.js";

export class FactsClient {
  public constructor(private readonly api: ApiClient) {}

  public list(params: Record<string, string | number | boolean> = {}): Promise<ApiResponse> {
    return this.api.get("/facts", { params });
  }

  public random(params: Record<string, string | number | boolean> = {}): Promise<ApiResponse> {
    return this.api.get("/facts/random", { params });
  }

  public getById(id: string | number): Promise<ApiResponse> {
    return this.api.get(`/facts/${encodeURIComponent(String(id))}`);
  }
}
