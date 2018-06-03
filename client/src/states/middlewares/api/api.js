import {API_CALL} from '../../actions/globalActionTypes';
import apiClient from '../../../utils/apiClient';

export const createNormalAction = (type, data, errors) => {
  return {
    type,
    data,
    errors,
  };
};

export default () => (action) => (next) => {
  if (action.type !== API_CALL) {
    return next(action);
  }

  const { types, method, endpoint, data } = action;

  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('INVALID API ACTION TYPES: ' +
      'Api Action must have `types` as an array of length 3');
  }

  if (typeof endpoint !== 'string') {
    throw new Error('INVALID API ENDPOINT: ' +
      'Api Action must have `endpoint` of type string')
  }

  const [requestActionType, successActionType, errorActionType] = types;

  next(createNormalAction(requestActionType, action.data, []));

  const config = {data, method};

  return apiClient(endpoint, config)
    .then(response => {
      next(createNormalAction(successActionType, response.data.data, []));
    })
    .catch(response => {
      if (response.data && response.data.errors) {
        return next(createNormalAction(errorActionType, {}, response.data.errors));
      } else if (response.error) {
        return next(createNormalAction(errorActionType, {}, [response.error]));
      }
      next(createNormalAction(
        errorActionType,
        [
          'Error occurred but response does not provide specific error message',
          response,
        ]
      ));
    });
};