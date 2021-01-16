import { registerEnumType } from 'type-graphql';

export enum BonusType {
  WOOD_EFFICIENCY = 'WOOD_EFFICIENCY',
  STONE_EFFICIENCY = 'STONE_EFFICIENCY',
  IRON_EFFICIENCY = 'IRON_EFFICIENCY',
  EFFICIENCY = 'EFFICIENCY',
  SALE = 'SALE',
  LUMBERJACK_SALE = 'LUMBERJACK_SALE',
  MINER_SALE = 'MINER_SALE',
  BLACKSMITH_SALE = 'BLACKSMITH_SALE',
  FREEZE = 'FREEZE',
  TAX = 'TAX',
}

export enum BonusTargetType {
  YOURSELF = 'YOURSELF',
  OTHERS = 'OTHERS',
}

registerEnumType(BonusType, {
  name: 'BonusType',
});

registerEnumType(BonusTargetType, {
  name: 'BonusTargetType',
});

export const BonusTypeToTargetType = {
  [BonusType.EFFICIENCY]: BonusTargetType.YOURSELF,
  [BonusType.WOOD_EFFICIENCY]: BonusTargetType.YOURSELF,
  [BonusType.STONE_EFFICIENCY]: BonusTargetType.YOURSELF,
  [BonusType.IRON_EFFICIENCY]: BonusTargetType.YOURSELF,
  [BonusType.SALE]: BonusTargetType.YOURSELF,
  [BonusType.LUMBERJACK_SALE]: BonusTargetType.YOURSELF,
  [BonusType.MINER_SALE]: BonusTargetType.YOURSELF,
  [BonusType.BLACKSMITH_SALE]: BonusTargetType.YOURSELF,
  [BonusType.FREEZE]: BonusTargetType.OTHERS,
  [BonusType.TAX]: BonusTargetType.OTHERS,
};

export const BonusTypeToUnique = {
  [BonusType.EFFICIENCY]: false,
  [BonusType.WOOD_EFFICIENCY]: false,
  [BonusType.STONE_EFFICIENCY]: false,
  [BonusType.IRON_EFFICIENCY]: false,
  [BonusType.SALE]: false,
  [BonusType.LUMBERJACK_SALE]: false,
  [BonusType.MINER_SALE]: false,
  [BonusType.BLACKSMITH_SALE]: false,
  [BonusType.FREEZE]: true,
  [BonusType.TAX]: true,
};

export const BonusTypeToDescription = {
  [BonusType.EFFICIENCY]:
    'Increase the efficiency of all resource gathering for yourself',
  [BonusType.WOOD_EFFICIENCY]:
    'Increase the efficiency of wood gathering for yourself',
  [BonusType.STONE_EFFICIENCY]:
    'Increase the efficiency of stone gathering for yourself',
  [BonusType.IRON_EFFICIENCY]:
    'Increase the efficiency of iron gathering for yourself',
  [BonusType.SALE]: 'All resource collectors are on sale for yourself',
  [BonusType.LUMBERJACK_SALE]: 'Lumberjacks are on sale for yourself',
  [BonusType.MINER_SALE]: 'Miners are on sale for yourself',
  [BonusType.BLACKSMITH_SALE]: 'Blacksmiths are on sale for yourself',
  [BonusType.FREEZE]: 'Slow down resource gathering for all other players',
  [BonusType.TAX]: 'Increase resource collectors cost for all other players',
};

export const BonusTypeLevelMap: {
  [key in BonusType]: { [key: number]: number };
} = {
  [BonusType.EFFICIENCY]: {
    1: 1.5,
    2: 3,
    3: 4.5,
  },
  [BonusType.WOOD_EFFICIENCY]: {
    1: 2.5,
    2: 5,
    3: 10,
  },
  [BonusType.STONE_EFFICIENCY]: {
    1: 2.5,
    2: 5,
    3: 10,
  },
  [BonusType.IRON_EFFICIENCY]: {
    1: 2.5,
    2: 5,
    3: 10,
  },
  [BonusType.SALE]: {
    1: 0.8,
    2: 0.65,
    3: 0.5,
  },
  [BonusType.LUMBERJACK_SALE]: {
    1: 0.75,
    2: 0.5,
    3: 0.25,
  },
  [BonusType.MINER_SALE]: {
    1: 0.75,
    2: 0.5,
    3: 0.25,
  },
  [BonusType.BLACKSMITH_SALE]: {
    1: 0.75,
    2: 0.5,
    3: 0.25,
  },
  [BonusType.FREEZE]: {
    1: 0.75,
    2: 0.5,
    3: 0.2,
  },
  [BonusType.TAX]: {
    1: 1.25,
    2: 2,
    3: 4,
  },
};
