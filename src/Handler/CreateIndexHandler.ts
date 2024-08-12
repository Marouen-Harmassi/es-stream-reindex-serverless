import { ElasticsearchClient } from "~/Client/ElasticsearchClient";
import { ElasticsearchAliasEnum } from "~/Enum/ElasticsearchAliasEnum";
import * as ElasticsearchAlias from "~/Enum/ElasticsearchAliasEnum";
import { FullIndexEventType } from "~/Model/FullIndexEvent";

export class CreateIndexHandler {
  protected elasticsearchClient: ElasticsearchClient;

  public constructor(esClient: ElasticsearchClient) {
    this.elasticsearchClient = esClient;
  }

  public static getMapping(alias: string): string {
    switch (alias) {
      case "seller":
        return require("../../aws/elasticsearch/mapping-seller");
      default:
        throw new Error("Invalid alias.");
    }
  }

  public async handle(event: FullIndexEventType): Promise<FullIndexEventType> {
    const alias: ElasticsearchAliasEnum = event.alias;
    const mapping: any = CreateIndexHandler.getMapping(alias);
    const index: string = ElasticsearchAlias.getIndex(alias);
    const aliasPending: string = ElasticsearchAlias.getPending(alias);

    // Delete any alias pending if found
    if (await this.elasticsearchClient.aliasExist(aliasPending)) {
      await this.elasticsearchClient.aliasDelete(aliasPending);
    }

    // Delete any index with pending alias if found
    if (await this.elasticsearchClient.indexExist(aliasPending)) {
      await this.elasticsearchClient.indexDelete(aliasPending);
    }

    mapping.aliases = {};
    mapping.aliases[aliasPending] = {};

    await this.elasticsearchClient.indexCreate(index, mapping);

    return {
      alias,
      aliasPending,
      index,
      lastEvaluatedKey: null,
    };
  }
}
