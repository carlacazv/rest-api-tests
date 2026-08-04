import type { ApiClient, ApiResponse } from "../../core/http/api-client.js";

export interface ImageSearchParams {
  limit?: number;
  page?: number;
  order?: "ASC" | "DESC" | "RANDOM";
  has_breeds?: boolean;
  breed_ids?: string;
  category_ids?: string;
  mime_types?: string;
  size?: "small" | "med" | "full";
  format?: string;
}

export class ImagesClient {
  public constructor(private readonly api: ApiClient) {}

  public search(params: ImageSearchParams = {}): Promise<ApiResponse> {
    return this.api.get("/images/search", { params });
  }

  public getById(id: string): Promise<ApiResponse> {
    return this.api.get(`/images/${encodeURIComponent(id)}`);
  }

  public listMine(params: Record<string, string | number | boolean> = {}): Promise<ApiResponse> {
    return this.api.get("/images", { params });
  }

  public upload(input: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
    subId: string;
  }): Promise<ApiResponse> {
    return this.api.post("/images/upload", {
      multipart: {
        file: {
          name: input.fileName,
          mimeType: input.mimeType,
          buffer: input.buffer,
        },
        sub_id: input.subId,
      },
    });
  }

  public delete(id: string): Promise<ApiResponse> {
    return this.api.delete(`/images/${encodeURIComponent(id)}`);
  }
}
