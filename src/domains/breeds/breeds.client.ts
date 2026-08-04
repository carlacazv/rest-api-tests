import type { ApiClient, ApiResponse } from "../../core/http/api-client.js";

export class BreedsClient {
  public constructor(private readonly api: ApiClient) {}

  public list(params: Record<string, string | number | boolean> = {}): Promise<ApiResponse> {
    return this.api.get("/breeds", { params });
  }

  public search(query: string, params: Record<string, string | number | boolean> = {}): Promise<ApiResponse> {
    return this.api.get("/breeds/search", { params: { q: query, ...params } });
  }

  public getById(id: string | number, lang?: string): Promise<ApiResponse> {
    return this.api.get(`/breeds/${encodeURIComponent(String(id))}`, {
      params: { lang },
    });
  }

  public groups(speciesId?: string): Promise<ApiResponse> {
    return this.api.get("/breeds/breed-groups", { params: { species_id: speciesId } });
  }

  public colours(id: string | number): Promise<ApiResponse> {
    return this.api.get(`/breeds/${encodeURIComponent(String(id))}/colours`);
  }
}
