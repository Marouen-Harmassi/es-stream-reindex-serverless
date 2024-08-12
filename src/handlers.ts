import { lambdaHandler } from ""; // TODO
import {
  createIndexHandler,
  deleteUnusedIndicesHandler,
  fullIndexHandler,
  rollbackIndexHandler,
  switchAliasHandler,
} from "~/index";
import { FullIndexEventType } from "~/Model/FullIndexEvent";

export const createIndex: any = lambdaHandler.handle(
  async (event: FullIndexEventType): Promise<FullIndexEventType> => {
    return await createIndexHandler.handle(event);
  }
);

export const fullIndex: any = lambdaHandler.handle(
  async (event: FullIndexEventType): Promise<FullIndexEventType> => {
    return await fullIndexHandler.handle(event);
  }
);

export const switchIndex: any = lambdaHandler.handle(
  async (event: FullIndexEventType): Promise<FullIndexEventType> => {
    return await switchAliasHandler.handle(event);
  }
);

export const rollbackIndex: any = lambdaHandler.handle(
  async (event: FullIndexEventType): Promise<string> => {
    return await rollbackIndexHandler.handle(event);
  }
);

export const deleteUnusedIndices: any = lambdaHandler.handle(
  async (event: FullIndexEventType): Promise<string> => {
    return await deleteUnusedIndicesHandler.handle(event);
  }
);
