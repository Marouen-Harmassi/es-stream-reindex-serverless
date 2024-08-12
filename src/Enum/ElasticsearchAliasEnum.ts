import dayjs from "dayjs";

export enum ElasticsearchAliasEnum {
  SELLER = "seller",
}

export const getIndex: (alias: ElasticsearchAliasEnum) => string = (
  alias: ElasticsearchAliasEnum
): string => `${alias}-${dayjs().format("YYYYMMDDHHmmss")}`;

export const getPending: (alias: ElasticsearchAliasEnum) => string = (
  alias: ElasticsearchAliasEnum
): string => `${alias}-pending`;

export const getJsonDocId: (
  index: ElasticsearchAliasEnum,
  jsonDoc: any
) => string = (index: ElasticsearchAliasEnum, jsonDoc: any): string => {
  const getEsNameId: (indexName: string) => string[] = (
    indexName: string
  ): string[] => {
    switch (indexName) {
      case "seller":
        return ["correlation_id"];
      default:
        throw new Error("invalid index");
    }
  };

  const keys: string[] = getEsNameId(index);
  let id: string = "";

  for (const key of keys) {
    id += jsonDoc[key];
  }

  return id;
};
