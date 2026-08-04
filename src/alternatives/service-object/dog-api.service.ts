import type { ApiClient, ApiResponse } from "../../core/http/api-client.js";

export class DogApiService {
  public constructor(private readonly api: ApiClient) {}

  public listBreeds(limit = 20, page = 0): Promise<ApiResponse> {
    return this.api.get("/breeds", { params: { limit, page } });
  }

  public searchBreeds(query: string, limit = 10): Promise<ApiResponse> {
    return this.api.get("/breeds/search", { params: { q: query, limit } });
  }

  public searchImages(
    limit = 5,
    order: "ASC" | "DESC" | "RANDOM" = "RANDOM",
  ): Promise<ApiResponse> {
    return this.api.get("/images/search", { params: { limit, order } });
  }

  public listCategories(limit = 10, page = 0): Promise<ApiResponse> {
    return this.api.get("/categories", { params: { limit, page } });
  }

  public listFacts(limit = 10, offset = 0): Promise<ApiResponse> {
    return this.api.get("/facts", { params: { limit, offset } });
  }

  public listFavourites(limit = 10): Promise<ApiResponse> {
    return this.api.get("/favourites", { params: { limit } });
  }

  public createFavourite(imageId: string, subId: string): Promise<ApiResponse> {
    return this.api.post("/favourites", { data: { image_id: imageId, sub_id: subId } });
  }

  public deleteFavourite(id: string | number): Promise<ApiResponse> {
    return this.api.delete(`/favourites/${encodeURIComponent(String(id))}`);
  }

  public listVotes(limit = 10): Promise<ApiResponse> {
    return this.api.get("/votes", { params: { limit } });
  }
}
