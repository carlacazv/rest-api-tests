import type { ApiClient, ApiResponse } from "../../core/http/api-client.js";

export class FavouritesClient {
  public constructor(private readonly api: ApiClient) {}

  public list(params: Record<string, string | number | boolean> = {}): Promise<ApiResponse> {
    return this.api.get("/favourites", { params });
  }

  public getById(id: string | number): Promise<ApiResponse> {
    return this.api.get(`/favourites/${encodeURIComponent(String(id))}`);
  }

  public create(imageId: string, subId: string): Promise<ApiResponse> {
    return this.api.post("/favourites", {
      data: { image_id: imageId, sub_id: subId },
    });
  }

  public delete(id: string | number): Promise<ApiResponse> {
    return this.api.delete(`/favourites/${encodeURIComponent(String(id))}`);
  }
}
