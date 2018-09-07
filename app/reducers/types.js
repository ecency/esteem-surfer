export type commonActionType = {
  type: string,
  payload?: {}
};

export type postStateType = {
  +list: [],
  +groups: {},
  +loading: boolean
};

export type TtStateType = {
  +list: [],
  +loading: boolean,
  +error: boolean
};

export type GlobalStateType = {};
