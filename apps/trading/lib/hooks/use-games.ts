import {
  useGamesQuery,
  type GameFieldsFragment,
  type TeamEntityFragment,
} from './__generated__/Games';
import orderBy from 'lodash/orderBy';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useEpochInfoQuery } from './__generated__/Epoch';
import { type ApolloError } from '@apollo/client';
import { TEAMS_STATS_EPOCHS } from './constants';

const findTeam = (entities: GameFieldsFragment['entities'], teamId: string) => {
  const team = entities.find(
    (ent) => ent.__typename === 'TeamGameEntity' && ent.team.teamId === teamId
  );
  if (team?.__typename === 'TeamGameEntity') return team; // drops __typename === 'IndividualGameEntity' from team object
  return undefined;
};

export type Game = GameFieldsFragment & {
  /** The team entity data accessible only if scoped to particular team.  */
  team?: TeamEntityFragment;
};
export type TeamGame = Game & { team: NonNullable<Game['team']> };

const isTeamGame = (game: Game): game is TeamGame => game.team !== undefined;
export const areTeamGames = (games?: Game[]): games is TeamGame[] =>
  Boolean(games && games.filter((g) => isTeamGame(g)).length > 0);

type GamesData = {
  data?: Game[];
  loading: boolean;
  error?: ApolloError;
};

export const useGames = (teamId?: string, epochFrom?: number): GamesData => {
  const {
    data: epochData,
    loading: epochLoading,
    error: epochError,
  } = useEpochInfoQuery({
    skip: Boolean(epochFrom),
  });

  let from = epochFrom;
  if (!from && epochData) {
    from = Number(epochData.epoch.id) - TEAMS_STATS_EPOCHS;
    if (from < 1) from = 1; // make sure it's not negative
  }

  const { data, loading, error } = useGamesQuery({
    variables: {
      epochFrom: from,
      teamId: teamId,
    },
    skip: !from,
    fetchPolicy: 'cache-and-network',
    context: { isEnlargedTimeout: true },
  });

  const allGames = removePaginationWrapper(data?.games.edges);
  const allOrScoped = allGames
    .map((g) => ({
      ...g,
      team: teamId ? findTeam(g.entities, teamId) : undefined,
    }))
    .filter((g) => {
      // passthrough if not scoped to particular team
      if (!teamId) return true;
      return isTeamGame(g);
    });

  const games = orderBy(allOrScoped, 'epoch', 'desc');

  return {
    data: games,
    loading: loading || epochLoading,
    error: error || epochError,
  };
};
