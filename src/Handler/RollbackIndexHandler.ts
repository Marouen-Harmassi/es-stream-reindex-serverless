import { ElasticsearchClient } from "~/Client/ElasticsearchClient";
import { FullIndexEventType } from "~/Model/FullIndexEvent";

export class RollbackIndexHandler {
  public constructor(protected elasticsearchClient: ElasticsearchClient) {}
  public async handle(event: FullIndexEventType): Promise<string> {
    if (await this.elasticsearchClient.indexExist(event.index)) {
      await this.elasticsearchClient.indexDelete(event.index);
    }

    return "success";
  }
}
