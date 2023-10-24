import { getDateTimeFormat } from '@vegaprotocol/utils';
import { useReferralProgram } from './hooks/use-referral-program';
import { Table } from './table';
import classNames from 'classnames';
import { BORDER_COLOR, GRADIENT } from './constants';
import { Tag } from './tag';
import type { ComponentProps, ReactNode } from 'react';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { DApp, TOKEN_PROPOSALS, useLinks } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';

const Loading = ({ variant }: { variant: 'large' | 'inline' }) => (
  <div
    className={classNames(
      'bg-vega-clight-800 dark:bg-vega-cdark-800 rounded-lg animate-pulse',
      {
        'w-full h-20': variant === 'large',
      }
    )}
  ></div>
);

const StakingTier = ({
  tier,
  label,
  referralRewardMultiplier,
  minimumStakedTokens,
}: {
  tier: number;
  label: string;
  referralRewardMultiplier: string;
  minimumStakedTokens: string;
}) => {
  const color: Record<number, ComponentProps<typeof Tag>['color']> = {
    1: 'green',
    2: 'blue',
    3: 'pink',
  };
  return (
    <div
      className={classNames(
        'overflow-hidden',
        'border rounded-md w-full',
        'flex flex-row',
        GRADIENT,
        BORDER_COLOR
      )}
    >
      <div aria-hidden className="max-w-[120px]">
        {tier < 4 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/${tier}x.png`}
            alt={`${referralRewardMultiplier}x multiplier`}
            width={240}
            height={240}
            className="w-full h-full"
          />
        )}
      </div>
      <div className={classNames('p-3')}>
        <Tag color={color[tier]}>Multiplier {referralRewardMultiplier}x</Tag>
        <h3 className="mt-1 mb-1 text-base">{label}</h3>
        <p className="text-sm text-vega-clight-100 dark:text-vega-cdark-100">
          {t('Stake a minimum of')} {minimumStakedTokens} {t('$VEGA tokens')}
        </p>
      </div>
    </div>
  );
};

export const TiersContainer = () => {
  const { benefitTiers, stakingTiers, details, loading, error } =
    useReferralProgram();

  const ends = details?.endOfProgramTimestamp
    ? getDateTimeFormat().format(new Date(details.endOfProgramTimestamp))
    : undefined;

  const governanceLink = useLinks(DApp.Governance);

  if ((!loading && !details) || error) {
    return (
      <div className="text-base px-5 py-10 text-center">
        {t(
          "We're sorry but we don't have an active referral programme currently running. You can propose a new programme"
        )}{' '}
        <ExternalLink href={governanceLink(TOKEN_PROPOSALS)}>
          {t('here')}
        </ExternalLink>
        .
      </div>
    );
  }

  return (
    <>
      {/* Benefit tiers */}
      <div className="flex flex-col items-baseline justify-between mt-10 mb-5">
        <h2 className="text-2xl">{t('Referral tiers')}</h2>
        {ends && (
          <span className="text-sm text-vega-clight-200 dark:text-vega-cdark-200">
            {t('Program ends:')} {ends}
          </span>
        )}
      </div>
      <div className="mb-20">
        {loading || !benefitTiers || benefitTiers.length === 0 ? (
          <Loading variant="large" />
        ) : (
          <TiersTable
            data={benefitTiers.map((bt) => ({
              ...bt,
              tierElement: (
                <div className="rounded-full bg-vega-clight-900 dark:bg-vega-cdark-900 p-1 w-8 h-8 text-center">
                  {bt.tier}
                </div>
              ),
            }))}
          />
        )}
      </div>

      {/* Staking tiers */}
      <div className="flex flex-row items-baseline justify-between mb-5">
        <h2 className="text-2xl">{t('Staking multipliers')}</h2>
      </div>
      <div className="mb-20 flex flex-col justify-items-stretch lg:flex-row gap-5">
        {loading || !stakingTiers || stakingTiers.length === 0 ? (
          <>
            <Loading variant="large" />
            <Loading variant="large" />
            <Loading variant="large" />
          </>
        ) : (
          <StakingTiers data={stakingTiers} />
        )}
      </div>
    </>
  );
};

const StakingTiers = ({
  data,
}: {
  data: ReturnType<typeof useReferralProgram>['stakingTiers'];
}) => (
  <>
    {data.map(
      ({ tier, label, referralRewardMultiplier, minimumStakedTokens }, i) => (
        <StakingTier
          key={i}
          tier={tier}
          label={label}
          referralRewardMultiplier={referralRewardMultiplier}
          minimumStakedTokens={minimumStakedTokens}
        />
      )
    )}
  </>
);

const TiersTable = ({
  data,
}: {
  data: Array<{
    tier: number;
    tierElement: ReactNode;
    commission: string;
    discount: string;
    volume: string;
  }>;
}) => {
  return (
    <Table
      columns={[
        { name: 'tierElement', displayName: t('Tier') },
        {
          name: 'commission',
          displayName: t('Referrer commission'),
          tooltip: t('A percentage of commission earned by the referrer'),
        },
        { name: 'discount', displayName: t('Referrer trading discount') },
        { name: 'volume', displayName: t('Min. trading volume') },
        { name: 'epochs', displayName: t('Min. epochs') },
      ]}
      data={data.map((d) => ({
        ...d,
        className: classNames({
          'from-vega-pink-400 dark:from-vega-pink-600 to-20%  bg-highlight':
            d.tier === 1,
          'from-vega-purple-400 dark:from-vega-purple-600 to-20%  bg-highlight':
            d.tier === 2,
          'from-vega-blue-400 dark:from-vega-blue-600 to-20%  bg-highlight':
            d.tier === 3,
          'from-vega-orange-400 dark:from-vega-orange-600 to-20%  bg-highlight':
            d.tier > 3,
        }),
      }))}
    />
  );
};
