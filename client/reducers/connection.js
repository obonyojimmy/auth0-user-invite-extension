import { fromJS } from 'immutable';

import * as constants from '../constants';
import createReducer from '../utils/createReducer';

const initialState = {
  loading: false,
  error: null,
  connection: [ ]
};

export const connection = createReducer(fromJS(initialState), {
  [constants.FETCH_CONNECTIONS_PENDING]: (state) =>
    state.merge({
      loading: true,
      error: null
    }),
  [constants.FETCH_CONNECTIONS_REJECTED]: (state, action) =>
    state.merge({
      loading: false,
      error: `An error occured while loading the connections: ${action.errorMessage}`
    }),
  [constants.FETCH_CONNECTIONS_FULFILLED]: (state, action) =>
    state.merge({
      loading: false,
      error: null,
      connection: fromJS(action.payload.data.result)
    })
});
