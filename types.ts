export enum AnimationState {
  CHAOS = 'CHAOS',
  MORPH = 'MORPH',
  TREE = 'TREE',
  FINISHED = 'FINISHED'
}

export interface ParticleData {
  position: [number, number, number];
  color: string;
  scale: number;
}