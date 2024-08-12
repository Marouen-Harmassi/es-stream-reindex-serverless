import { LoggerService } from ""; // TODO
import DynamoDB from "aws-sdk/clients/dynamodb";
import { DynamoDBError } from "~/Error/DynamoDBError";

export class DynamoDBClient {
  public constructor(
    protected awsDynamoDBClient: DynamoDB,
    protected logger: LoggerService,
    protected tableName: string
  ) {}

  public async deleteItem(key: DynamoDB.Types.Key): Promise<void> {
    try {
      const params: DynamoDB.Types.DeleteItemInput = {
        Key: key,
        ReturnValues: "NONE",
        TableName: this.tableName,
      };

      await this.awsDynamoDBClient.deleteItem(params).promise();
    } catch (error) {
      this.logger.error(`Error on deleteItem: "${error.message}"`, { error });
      throw new DynamoDBError(`Error on deleteItem: "${error.message}"`, error);
    }
  }

  public async scan(params?: {
    exclusiveStartKey?: DynamoDB.Types.Key;
    expressionAttributeNames?: DynamoDB.Types.ExpressionAttributeNameMap;
    expressionAttributeValues?: DynamoDB.Types.ExpressionAttributeValueMap;
    filterExpression?: DynamoDB.Types.ConditionExpression;
    limit?: DynamoDB.PositiveIntegerObject;
    projectionExpression?: DynamoDB.Types.ProjectionExpression;
  }): Promise<DynamoDB.Types.ScanOutput> {
    try {
      const paramsDynamoDB: DynamoDB.Types.ScanInput = {
        ExclusiveStartKey: params?.exclusiveStartKey,
        ExpressionAttributeNames: params?.expressionAttributeNames,
        ExpressionAttributeValues: params?.expressionAttributeValues,
        FilterExpression: params?.filterExpression,
        Limit: params?.limit,
        ProjectionExpression: params?.projectionExpression,
        ReturnConsumedCapacity: "TOTAL",
        TableName: this.tableName,
      };

      return await this.awsDynamoDBClient.scan(paramsDynamoDB).promise();
    } catch (error) {
      this.logger.error(`Error on deleteItem: "${error.message}"`, { error });
      throw new DynamoDBError(`Error on scan: "${error.message}"`, error);
    }
  }
}
