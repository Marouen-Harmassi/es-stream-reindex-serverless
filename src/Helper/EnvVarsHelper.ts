export class EnvVarsHelper {
  public constructor(
    public clientSource: string = `${process.env.TAG_BLOC}:${process.env.TAG_APP}:${process.env.TAG_COMP}`,
    public sellerTable: string = process.env.SELLER_TABLE,
    public waitScanBulkAfter: number = +process.env.WAIT_SCAN_BULK_AFTER,
    public awsRegionId: string = process.env.AWS_REGION_ID
  ) {}
}
