import { LoggerService } from ""; // TODO
import DynamoDB from "aws-sdk/clients/dynamodb";
import { DynamoDBClient } from "~/Client/DynamoDBClient";
import { EnvVarsHelper } from "~/Helper/EnvVarsHelper";

export class DynamoDBClientFactory {
  public constructor(
    protected awsDynamoDBClient: DynamoDB,
    protected envVarsHelper: EnvVarsHelper,
    protected logger: LoggerService
  ) {}

  public createForSeller(): DynamoDBClient {
    return new DynamoDBClient(
      this.awsDynamoDBClient,
      this.logger,
      this.envVarsHelper.sellerTable
    );
  }
}
