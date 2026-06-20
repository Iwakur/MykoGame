import { mykolaivHistoricPack } from './mykolaivHistoric';

export const packRegistry = {
  [mykolaivHistoricPack.meta.id]: mykolaivHistoricPack
} as const;

export type PackId = keyof typeof packRegistry;
