import { logger } from ""; // TODO
import { Client } from "@elastic/elasticsearch";
import createAwsElasticsearchConnector from "aws-elasticsearch-connector";
import DynamoDB from "aws-sdk/clients/dynamodb";
import AWS from "aws-sdk";
import { ElasticsearchClient } from "~/Client/ElasticsearchClient";
import { DynamoDBClientFactory } from "~/Factory/DynamoDBClientFactory";
import { CreateIndexHandler } from "~/Handler/CreateIndexHandler";
import { FullIndexHandler } from "~/Handler/FullIndexHandler";
import { RollbackIndexHandler } from "~/Handler/RollbackIndexHandler";
import { SwitchAliasHandler } from "~/Handler/SwitchAliasHandler";
import { EnvVarsHelper } from "~/Helper/EnvVarsHelper";
import { DeleteUnusedIndicesHandler } from "~/Handler/DeleteUnusedIndicesHandler";

const envVarsHelper = new EnvVarsHelper();

const awsDynamoDBClient = new DynamoDB({
  apiVersion: "2012-08-10",
  maxRetries: 5,
});

const createAwsElasticsearchConnectorParam = createAwsElasticsearchConnector(
  new AWS.Config({
    region: envVarsHelper.awsRegionId,
  })
);

const clientWithRetries = new Client({
  ...createAwsElasticsearchConnectorParam,
  maxRetries: 3,
  node: "",
  requestTimeout: 60000,
});

const clientWithoutRetries = new Client({
  ...createAwsElasticsearchConnectorParam,
  maxRetries: 0,
  node: "",
  requestTimeout: 60000,
});

const elasticsearchClient: ElasticsearchClient = new ElasticsearchClient(
  clientWithRetries,
  clientWithoutRetries,
  logger
);
const dynamoDBClientFactory: DynamoDBClientFactory = new DynamoDBClientFactory(
  awsDynamoDBClient,
  envVarsHelper,
  logger
);

export const createIndexHandler: CreateIndexHandler = new CreateIndexHandler(
  elasticsearchClient
);
export const fullIndexHandler: FullIndexHandler = new FullIndexHandler(
  elasticsearchClient,
  dynamoDBClientFactory,
  logger,
  envVarsHelper.waitScanBulkAfter
);
export const rollbackIndexHandler: RollbackIndexHandler = new RollbackIndexHandler(
  elasticsearchClient
);
export const switchAliasHandler: SwitchAliasHandler = new SwitchAliasHandler(
  elasticsearchClient
);
export const deleteUnusedIndicesHandler: DeleteUnusedIndicesHandler = new DeleteUnusedIndicesHandler(
  elasticsearchClient
);
