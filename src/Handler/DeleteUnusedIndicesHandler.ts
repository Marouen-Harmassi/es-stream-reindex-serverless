import { ElasticsearchClient } from "~/Client/ElasticsearchClient";
import { FullIndexEventType } from "~/Model/FullIndexEvent";

export class DeleteUnusedIndicesHandler {
  public constructor(protected elasticsearchClient: ElasticsearchClient) {}

  public async handle(event: FullIndexEventType): Promise<string> {
    try {
      const indices = await this.elasticsearchClient.getIndicesByName(
        `${event.alias}-*`
      );

      if (indices.length > 1) {
        // Keep only one index
        indices.splice(0, 1);
        for (let i = 0; i < indices.length; i++) {
          await this.elasticsearchClient.indexDelete(indices[i]);
        }
      }

      return "success";
    } catch (e) {
      throw new Error(`Alias ${e.message} : failed delete unused indexes.`);
    }
  }
}
