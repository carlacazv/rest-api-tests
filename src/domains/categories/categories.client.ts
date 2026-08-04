import type { ApiClient, ApiResponse } from "../../core/http/api-client.js";

export class CategoriesClient {
  public constructor(private readonly api: ApiClient) {}

  public list(limit?: number, page?: number): Promise<ApiResponse> {
    return this.api.get("/categories", { params: { limit, page } });
  }
}
