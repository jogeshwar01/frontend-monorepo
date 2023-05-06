import { useEffect, useState } from 'react';
import { useBlockStatisticsQuery } from './__generated__/BlockStatistics';
import sum from 'lodash/sum';

const DEFAULT_POLLS = 10;
const INTERVAL = 1000;
const durations = [] as number[];

const useAverageBlockDuration = (polls = DEFAULT_POLLS) => {
  const [avg, setAvg] = useState<number | undefined>(undefined);
  const { data } = useBlockStatisticsQuery({
    pollInterval: INTERVAL,
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    skip: durations.length === polls,
  });

  useEffect(() => {
    if (durations.length < polls && data) {
      durations.push(parseFloat(data.statistics.blockDuration));
    }
    if (durations.length === polls) {
      const averageBlockDuration = sum(durations) / durations.length; // ms
      console.log('setting avg', averageBlockDuration);
      setAvg(averageBlockDuration);
    }
  }, [data, polls]);

  return avg;
};

export const useTimeToUpgrade = (
  upgradeBlockHeight?: number,
  polls = DEFAULT_POLLS
) => {
  const [time, setTime] = useState<number | undefined>(undefined);
  const avg = useAverageBlockDuration(polls);
  const { data } = useBlockStatisticsQuery({
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  });

  useEffect(() => {
    const t =
      (Number(upgradeBlockHeight) - Number(data?.statistics.blockHeight)) *
      Number(avg);
    if (!isNaN(t)) {
      setTime(t);
    }
  }, [avg, data?.statistics.blockHeight, upgradeBlockHeight]);

  useEffect(() => {
    const i = setInterval(() => {
      if (time !== undefined) {
        setTime(time - 1000);
      }
    }, 1000);
    return () => {
      clearInterval(i);
    };
  }, [time]);

  return time;
};