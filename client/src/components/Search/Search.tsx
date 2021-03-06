import React from 'react';
import { DgraphQueryExecutor, Queries } from 'dgraph-query-manager';
import { useDgraphGlobal } from '../../hooks/dgraph';
import { Action, ActionType } from '../../reducers/base';
import { Card } from 'react-bootstrap';
import { useStateContext } from '../../state';

const Search = ({ location }) => {
  const [{ tweets }] = useStateContext();

  const cleanupQueryString = (query: string | null) => {
    let result;
    if (query) {
      result = query.replace('%23', '').replace('#', '');
    }
    return result;
  };

  const queryString = cleanupQueryString(
    new URLSearchParams(location.search).get('q')
  );

  console.log(queryString);

  const executor = new DgraphQueryExecutor(Queries.Search.search, {
    $query: queryString
  });

  useDgraphGlobal({
    executor,
    action: new Action(ActionType.SET_TWEETS),
    // Re-render if query changes.
    dependencies: [queryString],
    invalid: undefined,
    // Accept empty results.
    allowFailure: true
  });

  return (
    <Card className='SearchCard'>
      <Card.Body>
        <div>
          <p>
            Search for <b>{queryString}</b> found {tweets ? tweets.length : 0}{' '}
            results.
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Search;
