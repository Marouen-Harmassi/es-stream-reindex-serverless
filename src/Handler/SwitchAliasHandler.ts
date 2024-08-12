import { ElasticsearchClient } from "~/Client/ElasticsearchClient";
import { FullIndexEventType } from "~/Model/FullIndexEvent";

export class SwitchAliasHandler {
  public constructor(protected elasticsearchClient: ElasticsearchClient) {}

  public async handle(event: FullIndexEventType): Promise<FullIndexEventType> {
    try {
      const aliasExist: boolean = await this.elasticsearchClient.aliasExist(
        event.alias
      );
      if (aliasExist) {
        await this.elasticsearchClient.aliasDelete(event.alias);
      }

      await this.elasticsearchClient.aliasAdd(event.index, event.alias);

      await this.elasticsearchClient.aliasDelete(event.aliasPending);

      return event;
    } catch (e) {
      throw new Error(`Failed switch alias: ${e.message}.`);
    }
  }
}
