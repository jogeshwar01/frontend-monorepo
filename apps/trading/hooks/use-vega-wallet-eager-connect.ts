import { useVegaWallet, WALLET_CONFIG } from '@vegaprotocol/react-helpers';
import { useEffect } from 'react';
import { LocalStorage } from '@vegaprotocol/storage';
import { Connectors } from '../lib/connectors';

export function useEagerConnect() {
  const { connect } = useVegaWallet();

  useEffect(() => {
    const cfg = LocalStorage.getItem(WALLET_CONFIG);
    const cfgObj = JSON.parse(cfg);

    // No stored config, user has never connected or manually cleared storage
    if (!cfgObj || !cfgObj.connector) {
      return;
    }

    // Use the connector string in local storage to find the right connector to auto
    // connect to
    const connector = Connectors[cfgObj.connector];

    // Developer hasn't provided this connector
    if (!connector) {
      throw new Error(`Connector ${cfgObj?.connector} not configured`);
    }

    connect(Connectors[cfgObj.connector]);
  }, [connect]);
}
