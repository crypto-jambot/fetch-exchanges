import "dotenv/config";
import { BigQueryUtil } from "@crypto-jambot/bigquery-utils";
import { Request, Response } from "@google-cloud/functions-framework";
const util = new BigQueryUtil();
type Exchange = {
    blockchain: string;
    exchangeName: string;
    blockCursor: string;
    factoryAddress: string;
    routerAddress: string;
    poolCreationEventName: string;
    dataset: string;
    table: string;
    primaryKey: string;
};

type FilteredExchange = {
    blockchain: string;
    exchangeName: string;
    numberOfBlocks: number;
    rpcBlockBatchSize: number;
    table: string;
};

export async function getExchanges(req: Request, res: Response) {
    if (req.method != "GET") {
        res.status(400).send("Must be a GET request.");
        return;
    }
    try {
        const exchanges = await filterExchanges();
        res.status(200).send(exchanges);
    } catch (err) {
        res.status(500).send(err);
    }
}
function filterExchanges() {
    return new Promise<FilteredExchange[]>(async (resolve, reject) => {
        try {
            const result = await util.query<Exchange>(
                process.env.QUERY as string
            );
            resolve(
                result.map(({ blockchain, exchangeName, table }) => {
                    return {
                        blockchain,
                        exchangeName,
                        numberOfBlocks: parseInt(
                            process.env.NUMBER_OF_BLOCKS as string
                        ),
                        rpcBlockBatchSize: parseInt(
                            process.env.RPC_BLOCK_BATCH_SIZE as string
                        ),
                        table,
                    };
                })
            );
        } catch (err: any) {
            reject(err.errors ?? err);
        }
    });
}
