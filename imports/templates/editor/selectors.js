import { createSelector } from 'reselect';
import { get, reject, take, isEqual, find } from 'lodash/fp';

export const getSelectedPaths = get(['editor', 'selectedItemPaths']);
export const getMovingPaths = createSelector(
  [getSelectedPaths],
  paths => reject(consideredPath => find(possibleParent => {
    if (possibleParent.length >= consideredPath.length) {
      return false;
    }

    const precursor = take(possibleParent.length, consideredPath);
    return isEqual(precursor, possibleParent);
  })(paths))(paths),
);
