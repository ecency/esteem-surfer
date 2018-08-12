export type counterStateType = {
    +counter: number
};

export type postStateType = {
    +list: [],
    +groups: {},
    +loading: boolean
};

export type postActionType = {
    type: string,
    payload?: {},
};