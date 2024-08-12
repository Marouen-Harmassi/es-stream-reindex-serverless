import { LoggerService } from ""; // TODO
import { ApiResponse } from "@elastic/elasticsearch";
import AWS from "aws-sdk";
import HttpStatus from "http-status-codes";
import { DynamoDBClient } from "~/Client/DynamoDBClient";
import { ElasticsearchClient } from "~/Client/ElasticsearchClient";
import {
  ElasticsearchAliasEnum,
  getJsonDocId,
} from "~/Enum/ElasticsearchAliasEnum";
import { DynamoDBClientFactory } from "~/Factory/DynamoDBClientFactory";
import { FullIndexEventType } from "~/Model/FullIndexEvent";

const MAX_TIMEOUT: number = 800;

export class FullIndexHandler {
  public constructor(
    protected elasticsearchClient: ElasticsearchClient,
    protected dynamoDBClientFactory: DynamoDBClientFactory,
    protected logger: LoggerService,
    protected waitScanBulkAfter: number
  ) {}

  public async handle(event: FullIndexEventType): Promise<FullIndexEventType> {
    if (true === event.nextStep) {
      throw new Error("nextStep value is true.");
    }

    const uptime: number = process.uptime();
    const dynamoDBClient: DynamoDBClient = this.getDynamoDBClientByAlias(
      event.alias
    );
    event.terminated = false;

    const promises: Array<Promise<any>> = [];

    do {
      let cycle: number = this.waitScanBulkAfter;
      do {
        cycle--;

        const result: AWS.DynamoDB.Types.ScanOutput = await dynamoDBClient.scan(
          {
            exclusiveStartKey: event?.lastEvaluatedKey,
          }
        );
        event.lastEvaluatedKey = result.LastEvaluatedKey;

        const items: any[] = [];
        for (const item of result.Items) {
          let data: any = AWS.DynamoDB.Converter.unmarshall(item);
          if ("seller" === event.alias) {
            data = {
              civility: data.seller_civility,
              correlation_id: data.seller_correlation_id,
              email: data.seller_email,
              firstname: data.seller_firstname,
              lastname: data.seller_lastname,
              phone: data.seller_phone,
            };
          }
          items.push({
            create: {
              _id: getJsonDocId(event.alias, data),
              _index: event.index,
              _type: "_doc",
            },
          });
          items.push(data);
        }

        promises.push(this.startBulk(items));

        event.terminated =
          event.lastEvaluatedKey === null ||
          typeof event.lastEvaluatedKey === "undefined";
      } while (cycle > 0 && !event.terminated);

      (await Promise.allSettled(promises)).map(
        (result: PromiseSettledResult<void>) => {
          if (result.status === "rejected") {
            throw new Error(`Error on index="${result.reason.message}"`);
          }
        }
      );

      this.logger.debug("wait bulk");
    } while (process.uptime() - uptime <= MAX_TIMEOUT && !event.terminated);

    event.nextStep = event.terminated;

    return event;
  }

  public async startBulk(items: any): Promise<void> {
    const response: ApiResponse = await this.elasticsearchClient.bulk(items);
    const bulk: any = response.body;

    let created: number = 0;
    let conflict: number = 0;
    for (const item of bulk.items) {
      if ("status" in item.create) {
        switch (item.create.status) {
          case HttpStatus.CREATED:
            created++;
            break;
          case HttpStatus.CONFLICT:
            conflict++;
            break;
          default:
            this.logger.error("Error bulk", {
              error: item.create.error,
              status: item.create.status,
            });
            throw new Error(`Error bulk item: ${item.create.error}`);
        }
      }
    }

    this.logger.info(`Success bulking ${bulk.items.length} items.`, {
      conflict,
      created,
    });
    await this.logger.flush();
  }

  protected getDynamoDBClientByAlias(
    alias: ElasticsearchAliasEnum
  ): DynamoDBClient {
    switch (alias) {
      case ElasticsearchAliasEnum.SELLER:
        return this.dynamoDBClientFactory.createForSeller();
      default:
        throw new Error(`Invalid alias ${alias}.`);
    }
  }
}
