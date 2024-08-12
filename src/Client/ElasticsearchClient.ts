import { LoggerService } from ""; // TODO
import { ApiResponse, Client } from "@elastic/elasticsearch";
import { Search } from "@elastic/elasticsearch/api/requestParams";
import httpCode from "http-status-codes";

export class ElasticsearchClient {
  public constructor(
    protected esClientWithRetries: Client,
    protected esClientWithoutRetries: Client,
    protected logger: LoggerService
  ) {}

  public async aliasAdd(index: string, name: string): Promise<boolean> {
    try {
      const result: any = await this.esClientWithRetries.indices.putAlias({
        index,
        name,
      });

      if (!result) {
        this.logger.error(`Failed to add alias ${name} on index ${index}`);
        return false;
      }

      this.logger.info(`Added alias ${name} on index ${index}`);
      return true;
    } catch (error) {
      const message = `Add alias ${name} on ${index} error: "${error.message}".`;
      this.logger.error(message, { error });

      throw new Error(message);
    }
  }

  public async aliasDelete(name: string): Promise<boolean> {
    try {
      const result: any = await this.esClientWithRetries.indices.deleteAlias({
        index: "_all",
        name,
      });

      if (!result) {
        this.logger.error(`Failed to delete alias ${name}`);
        return false;
      }

      this.logger.info(`Alias ${name} deleted.`);
      return true;
    } catch (error) {
      const message: string = `Delete alias ${name} on _all error: "${error.message}".`;
      this.logger.error(message, { error });

      throw new Error(message);
    }
  }

  public async aliasExist(name: string): Promise<boolean> {
    try {
      this.logger.info(`Check if alias ${name} exist...`);
      const result: ApiResponse = await this.esClientWithRetries.indices.existsAlias(
        { name }
      );

      return httpCode.OK === result.statusCode;
    } catch (error) {
      const message: string = `Error on check alias: "${error.message}".`;
      this.logger.error(message, { error });

      throw new Error(message);
    }
  }

  public async bulk(body: any[]): Promise<ApiResponse> {
    try {
      return await this.esClientWithRetries.bulk(
        { body },
        { requestTimeout: 120000 }
      );
    } catch (error) {
      const message: string = `Error on bulk: "${error.message}"`;
      this.logger.error(message, { error });

      throw new Error(message);
    }
  }

  public async getIndicesByName(name: string): Promise<Array<any>> {
    try {
      this.logger.info(`Get indices by name ${name}`);
      let indices = [];
      const response = await this.esClientWithoutRetries.cat.indices({
        format: "json",
        index: name,
        s: "index:desc",
      });

      if (response) {
        indices = response.body.map((r) => r.index);
        this.logger.info(
          `Indices found for alias ${name} : ${JSON.stringify(indices)}`
        );
      }
      return indices;
    } catch (error) {
      const message: string = `Error on get indices by name: "${error.message}"`;
      this.logger.error(message, { error });

      throw new Error(message);
    }
  }

  public async indexCreate(index: string, body: any): Promise<ApiResponse> {
    try {
      this.logger.info(`Create "index" ${index}`);
      return await this.esClientWithoutRetries.indices.create({ body, index });
    } catch (error) {
      const message: string = `Error on create index: "${error.message}"`;
      this.logger.error(message, { error });

      throw new Error(message);
    }
  }

  public async indexDelete(index: string): Promise<boolean> {
    try {
      await this.esClientWithRetries.indices.delete({ index: index });
      this.logger.info(`Index ${index} deleted.`);
      return true;
    } catch (error) {
      const message: string = `Index delete error: ${error.message}.`;
      this.logger.error(message, { error });

      throw new Error(message);
    }
  }

  public async indexExist(name: string): Promise<boolean> {
    try {
      this.logger.info(`Check if index ${name} exist...`);
      const result: ApiResponse = await this.esClientWithRetries.indices.exists(
        { index: name }
      );

      return httpCode.OK === result.statusCode;
    } catch (error) {
      const message: string = `Error on test index: "${error.message}".`;
      this.logger.error(message, { error });

      throw new Error(message);
    }
  }

  public async search(params: Search): Promise<any> {
    try {
      return await this.esClientWithRetries.search(params);
    } catch (error) {
      const message: string = `Search error: ${error.message}.`;
      this.logger.error(message, { error });

      throw new Error(message);
    }
  }
}
