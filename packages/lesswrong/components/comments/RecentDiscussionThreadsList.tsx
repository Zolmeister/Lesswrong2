import React, { useState, useCallback } from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useMulti } from '../../lib/crud/withMulti';
import { Posts } from '../../lib/collections/posts';
import { useCurrentUser } from '../common/withUser';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { useGlobalKeydown } from '../common/withGlobalKeydown';

const RecentDiscussionThreadsList = ({
  terms, commentsLimit, maxAgeHours, af,
  title="Recent Discussion", shortformButton=true
}: {
  terms: any,
  commentsLimit?: number,
  maxAgeHours?: number,
  af?: boolean,
  title?: string,
  shortformButton?: boolean,
}) => {
  const [expandAllThreads, setExpandAllThreads] = useState(false);
  const [showShortformFeed, setShowShortformFeed] = useState(false);
  const currentUser = useCurrentUser();
  
  const { results, loading, loadMore, loadingMore, refetch } = useMulti({
    terms,
    collection: Posts,
    fragmentName: 'PostsRecentDiscussion',
    fetchPolicy: 'cache-and-network',
    enableTotal: false,
    pollInterval: 0,
    extraVariables: {
      commentsLimit: 'Int',
      maxAgeHours: 'Int',
      af: 'Boolean',
    },
    extraVariablesValues: {
      commentsLimit, maxAgeHours, af
    },
    ssr: true,
  });

  useGlobalKeydown(event => {
    const F_Key = 70
    if ((event.metaKey || event.ctrlKey) && event.keyCode == F_Key) {
      setExpandAllThreads(true);
    }
  });
  
  const toggleShortformFeed = useCallback(
    () => {
      setShowShortformFeed(!showShortformFeed);
    },
    [setShowShortformFeed, showShortformFeed]
  );
  
  const { SingleColumnSection, SectionTitle, SectionButton, ShortformSubmitForm, Loading, AnalyticsInViewTracker } = Components

  const { LoadMore } = Components

  if (!loading && results && !results.length) {
    return null
  }

  const expandAll = currentUser?.noCollapseCommentsFrontpage || expandAllThreads

  // TODO: Probably factor out "RecentDiscussionThreadsList" vs "RecentDiscussionSection", rather than making RecentDiscussionThreadsList cover both and be weirdly customizable
  return (
    <SingleColumnSection>
      <SectionTitle title={title}>
        {currentUser?.isReviewed && shortformButton && <div onClick={toggleShortformFeed}>
          <SectionButton>
            <AddBoxIcon />
            New Shortform Post
          </SectionButton>
        </div>}
      </SectionTitle>
      {showShortformFeed && <ShortformSubmitForm successCallback={refetch}/>}
      <div>
        {results && <div>
          {results.map((post, i) =>
            <Components.RecentDiscussionThread
              key={post._id}
              post={post}
              refetch={refetch}
              comments={post.recentComments}
              expandAllThreads={expandAll}
            />
          )}
        </div>}
        <AnalyticsInViewTracker eventProps={{inViewType: "loadMoreButton"}}>
            { loadMore && <LoadMore loadMore={loadMore}  /> }
            { (loading || loadingMore) && <Loading />}
        </AnalyticsInViewTracker>
      </div>
    </SingleColumnSection>
  )
}

const RecentDiscussionThreadsListComponent = registerComponent('RecentDiscussionThreadsList', RecentDiscussionThreadsList);

declare global {
  interface ComponentTypes {
    RecentDiscussionThreadsList: typeof RecentDiscussionThreadsListComponent,
  }
}

