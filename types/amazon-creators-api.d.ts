declare module "@amzn/creatorsapi-nodejs-sdk" {
  export class ApiClient {
    credentialId: string;
    credentialSecret: string;
    version: string;
  }

  export class DefaultApi {
    constructor(client: ApiClient);
    searchItems(
      marketplace: string,
      options: { searchItemsRequestContent: SearchItemsRequestContent },
    ): Promise<unknown>;
  }

  export class SearchItemsRequestContent {
    partnerTag?: string;
    keywords?: string;
    searchIndex?: string;
    itemCount?: number;
    itemPage?: number;
    languagesOfPreference?: string[];
    resources?: string[];
  }
}
