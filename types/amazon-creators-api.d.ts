declare module "@amzn/creatorsapi-nodejs-sdk" {
  export class ApiClient {
    credentialId: string;
    credentialSecret: string;
    version: string;
  }

  export class DefaultApi {
    constructor(client: ApiClient);
    getItems(
      marketplace: string,
      request: GetItemsRequestContent,
    ): Promise<unknown>;
    searchItems(
      marketplace: string,
      options: { searchItemsRequestContent: SearchItemsRequestContent },
    ): Promise<unknown>;
  }

  export class GetItemsRequestContent {
    constructor(partnerTag?: string, itemIds?: string[]);
    partnerTag?: string;
    itemIds?: string[];
    languagesOfPreference?: string[];
    resources?: string[];
  }

  export class SearchItemsRequestContent {
    partnerTag?: string;
    keywords?: string;
    searchIndex?: string;
    itemCount?: number;
    itemPage?: number;
    deliveryFlags?: string[];
    languagesOfPreference?: string[];
    minPrice?: number;
    maxPrice?: number;
    minReviewsRating?: number;
    sortBy?: string;
    resources?: string[];
  }
}
