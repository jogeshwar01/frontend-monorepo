import * as Schema from '@vegaprotocol/types';
import { gql } from 'graphql-request';
import { determineId } from '../utils';
import { requestGQL, setEndpoints } from './request';
import { vote } from './vote';
import { setupEthereumAccount } from './ethereum-setup';
import { faucetAsset } from './faucet-asset';
import {
  proposeMarket,
  waitForEnactment,
  waitForProposal,
} from './propose-market';
import { createLog } from './logging';

const log = createLog('create-market');

export async function createMarket(cfg: {
  vegaPubKey: string;
  token: string;
  ethWalletMnemonic: string;
  ethereumProviderUrl: string;
  vegaWalletUrl: string;
  vegaUrl: string;
  faucetUrl: string;
}) {
  // set and store request endpoints
  setEndpoints(cfg.vegaWalletUrl, cfg.vegaUrl);

  const markets = await getMarkets();

  if (markets.length) {
    log(
      `${markets.length} market${
        markets.length > 1 ? 's' : ''
      } found, skipping market creation`
    );
    return markets;
  }

  await setupEthereumAccount(
    cfg.vegaPubKey,
    cfg.ethWalletMnemonic,
    cfg.ethereumProviderUrl
  );

  const result = await faucetAsset(cfg.faucetUrl, 'fUSDC', cfg.vegaPubKey);
  if (!result.success) {
    throw new Error('faucet failed');
  }

  // propose and vote on a market
  const proposalTxResult = await proposeMarket(cfg.vegaPubKey, cfg.token);
  const proposalId = determineId(proposalTxResult.transaction.signature.value);
  log(`proposal created (id: ${proposalId})`);
  const proposal = await waitForProposal(proposalId);
  await vote(
    proposal.id,
    Schema.VoteValue.VALUE_YES,
    cfg.vegaPubKey,
    cfg.token
  );
  await waitForEnactment();

  // fetch and return created market
  const newMarkets = await getMarkets();
  return newMarkets;
}

async function getMarkets() {
  const query = gql`
    {
      marketsConnection {
        edges {
          node {
            id
            decimalPlaces
            positionDecimalPlaces
            state
            tradableInstrument {
              instrument {
                id
                name
                code
                metadata {
                  tags
                }
                product {
                  ... on Future {
                    settlementAsset {
                      id
                      symbol
                      decimals
                    }
                    quoteName
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await requestGQL<{
    marketsConnection: {
      edges: Array<{
        node: {
          id: string;
          decimalPlaces: number;
          positionDecimalPlaces: number;
          state: string;
          tradableInstrument: {
            instrument: {
              id: string;
              name: string;
              code: string;
              metadata: {
                tags: string[];
              };
              product: {
                settlementAssset: {
                  id: string;
                  symbol: string;
                  decimals: number;
                };
                quoteName: string;
              };
            };
          };
        };
      }>;
    };
  }>(query);

  return res.marketsConnection.edges.map((e) => e.node);
}