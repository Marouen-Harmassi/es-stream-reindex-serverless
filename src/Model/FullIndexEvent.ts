import { Key } from "aws-sdk/clients/dynamodb";
import { ElasticsearchAliasEnum } from "~/Enum/ElasticsearchAliasEnum";

export type FullIndexEventType = {
  alias?: ElasticsearchAliasEnum;
  aliasPending?: string;
  index?: string;
  lastEvaluatedKey?: Key;
  nextStep?: boolean;
  offset?: number;
  terminated?: boolean;
};
