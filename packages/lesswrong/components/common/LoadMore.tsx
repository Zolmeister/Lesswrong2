import { registerComponent, Components } from '../../lib/vulcan-lib';
import React from 'react';
import classNames from 'classnames';
import { queryIsUpdating } from './queryStatusUtils'
import {useTracking} from "../../lib/analyticsEvents";

const styles = theme => ({
  root: {
    ...theme.typography.body2,
    ...theme.typography.commentStyle,
    color: theme.palette.lwTertiary.main,
  },
  disabled: {
    color: theme.palette.grey[400],
    cursor: 'default',
    '&:hover': {
      opacity: 1
    }
  }
})


const LoadMore = ({ loadMore, count, totalCount, classes, disabled=false, networkStatus, loading=false, hidden=false }: {
  loadMore: any,
  count?: number,
  totalCount?: number,
  classes: ClassesType,
  disabled?: boolean,
  networkStatus?: any,
  loading?: boolean,
  hidden?: boolean,
}) => {
  const { captureEvent } = useTracking()

  if (hidden) return null;
  
  const { Loading } = Components
  const handleClickLoadMore = event => {
    event.preventDefault();
    loadMore();
    captureEvent("loadMoreClicked")
  }

  if (loading || (networkStatus && queryIsUpdating(networkStatus))) {
    return <div className={classes.loading}>
      <Loading/>
    </div>
  }

  return (
    <a
      className={classNames(classes.root, {[classes.disabled]: disabled})}
      href="#"
      onClick={handleClickLoadMore}
    >
      Load More {totalCount && <span> ({count}/{totalCount})</span>}
    </a>
  )
}

const LoadMoreComponent = registerComponent('LoadMore', LoadMore, {styles});

declare global {
  interface ComponentTypes {
    LoadMore: typeof LoadMoreComponent
  }
}
