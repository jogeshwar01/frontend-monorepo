import { useRef, useState } from 'react';
import { z } from 'zod';
import {
  Button,
  Loader,
  TradingFormGroup,
  TradingInput,
  TradingSelect,
} from '@vegaprotocol/ui-toolkit';
import { toNanoSeconds, VEGA_ID_REGEX } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { localLoggerFactory } from '@vegaprotocol/logger';
import { formatForInput } from '@vegaprotocol/utils';
import { subDays } from 'date-fns';

const DEFAULT_EXPORT_FILE_NAME = 'ledger_entries.csv';

const getProtoHost = (vegaurl: string) => {
  const loc = new URL(vegaurl);
  return `${loc.protocol}//${loc.host}`;
};

const downloadSchema = z.object({
  protohost: z.string().url().nonempty(),
  partyId: z.string().regex(VEGA_ID_REGEX).nonempty(),
  assetId: z.string().regex(VEGA_ID_REGEX).nonempty(),
  dateFrom: z.string().nonempty(),
  dateTo: z.string().optional(),
});

export const createDownloadUrl = (args: z.infer<typeof downloadSchema>) => {
  // check args from form inputs
  downloadSchema.parse(args);

  const params = new URLSearchParams();
  params.append('partyId', args.partyId);
  params.append('assetId', args.assetId);
  params.append('dateRange.startTimestamp', toNanoSeconds(args.dateFrom));

  if (args.dateTo) {
    params.append('dateRange.endTimestamp', toNanoSeconds(args.dateTo));
  }

  const url = new URL(args.protohost);
  url.pathname = '/api/v2/ledgerentry/export';
  url.search = params.toString();

  return url.toString();
};

interface Props {
  partyId: string;
  vegaUrl: string;
  assets: Record<string, string>;
}

export const LedgerExportForm = ({ partyId, vegaUrl, assets }: Props) => {
  const now = useRef(new Date());
  const [dateFrom, setDateFrom] = useState(() => {
    return formatForInput(subDays(now.current, 7));
  });
  const [dateTo, setDateTo] = useState('');
  const maxFromDate = formatForInput(new Date(dateTo || now.current));
  const maxToDate = formatForInput(now.current);

  const [isDownloading, setIsDownloading] = useState(false);
  const [assetId, setAssetId] = useState(Object.keys(assets)[0]);
  const protohost = getProtoHost(vegaUrl);
  const disabled = Boolean(!assetId || isDownloading);

  const assetDropDown = (
    <TradingSelect
      id="select-ledger-asset"
      value={assetId}
      onChange={(e) => {
        setAssetId(e.target.value);
      }}
      className="w-full"
      data-testid="select-ledger-asset"
      disabled={isDownloading}
    >
      {Object.keys(assets).map((assetKey) => (
        <option key={assetKey} value={assetKey}>
          {assets[assetKey]}
        </option>
      ))}
    </TradingSelect>
  );

  const startDownload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const link = createDownloadUrl({
        protohost,
        partyId,
        assetId,
        dateFrom,
        dateTo,
      });
      setIsDownloading(true);
      const resp = await fetch(link);
      const { headers } = resp;
      const nameHeader = headers.get('content-disposition');
      const filename = nameHeader?.split('=').pop() ?? DEFAULT_EXPORT_FILE_NAME;
      const blob = await resp.blob();
      if (blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      }
    } catch (err) {
      localLoggerFactory({ application: 'ledger' }).error('Download file', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!protohost || Object.keys(assets).length === 0) {
    return null;
  }

  return (
    <form onSubmit={startDownload} className="p-4 w-[350px]">
      <h2 className="mb-4">{t('Export ledger entries')}</h2>
      <TradingFormGroup label={t('Select asset')} labelFor="asset">
        {assetDropDown}
      </TradingFormGroup>
      <TradingFormGroup label={t('Date from')} labelFor="date-from">
        <TradingInput
          type="datetime-local"
          data-testid="date-from"
          id="date-from"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          disabled={disabled}
          max={maxFromDate}
        />
      </TradingFormGroup>
      <TradingFormGroup label={t('Date to')} labelFor="date-to">
        <TradingInput
          type="datetime-local"
          data-testid="date-to"
          id="date-to"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          disabled={disabled}
          max={maxToDate}
        />
      </TradingFormGroup>
      <div className="relative text-sm" title={t('Download all to .csv file')}>
        {isDownloading && (
          <div
            className="absolute flex items-center justify-center w-full h-full"
            data-testid="download-spinner"
          >
            <Loader size="small" />
          </div>
        )}
        <Button
          variant="primary"
          fill
          disabled={disabled}
          type="submit"
          data-testid="ledger-download-button"
        >
          {t('Download')}
        </Button>
      </div>
    </form>
  );
};