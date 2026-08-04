import type { ApiClient, ApiResponse } from "../../core/http/api-client.js";

export class VotesClient {
  public constructor(private readonly api: ApiClient) {}

  public list(params: Record<string, string | number | boolean> = {}): Promise<ApiResponse> {
    return this.api.get("/votes", { params });
  }

  public getById(id: string | number): Promise<ApiResponse> {
    return this.api.get(`/votes/${encodeURIComponent(String(id))}`);
  }

  public create(imageId: string, value: 0 | 1, subId: string): Promise<ApiResponse> {
    return this.api.post("/votes", {
      data: { image_id: imageId, value, sub_id: subId },
    });
  }

  public delete(id: string | number): Promise<ApiResponse> {
    return this.api.delete(`/votes/${encodeURIComponent(String(id))}`);
  }
}
