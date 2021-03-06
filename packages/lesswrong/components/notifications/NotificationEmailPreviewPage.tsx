import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import Users from '../../lib/collections/users/collection';
import { useCurrentUser } from '../common/withUser';
import { useLocation } from '../../lib/routeUtil';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';

const parseIds = (urlStr) => {
  if (!urlStr) return [];
  return urlStr.split(",");
}

const NotificationEmailPreviewPage = () => {
  const currentUser = useCurrentUser();
  const { query } = useLocation();
  const notificationIds = parseIds(query?.notificationIds);
  const postId = query?.postId;
  const { data, loading } = useQuery(gql`
      query EmailPreviewQuery($notificationIds: [String], $postId: String) {
        EmailPreview(notificationIds: $notificationIds, postId: $postId) { to subject html text }
      }
  `, {
    variables: {notificationIds, postId},
    ssr: true
  });
  
  if (!Users.isAdmin(currentUser))
    return <div>You must be logged in as an admin to use this page.</div>;

  const emails = data?.EmailPreview;
  
  return (
    <Components.SingleColumnSection>
      <p>This is an internal test page for previewing what notifications/posts will look
      like when they are sent as email. To use it, pass a URL parameter like</p>
      <code>
        localhost:3000/debug/notificationEmailPreview?notificationIds=[id1],[id2],[id3]
      </code>
      <p>or</p>
      <code>
        localhost:3000/debug/notificationEmailPreview?postId=[id]
      </code>
      <p>Use notificationIds to preview anything using the modern notification
      api. Use postId to see what the curation email will look like for that post.</p>
      <p>If there is more than one notification ID, the notifications must be of
      the same type and the email will be rendered as though the notifications
      were batched together in a daily batch.</p>
      <br/><br/>
      
      {loading && <Components.Loading/>}
      {!loading && emails && emails.map((email,i) =>
        <Components.EmailPreview key={i} email={email}/>
      )}
  </Components.SingleColumnSection>
  );
}

const NotificationEmailPreviewPageComponent = registerComponent("NotificationEmailPreviewPage", NotificationEmailPreviewPage);

declare global {
  interface ComponentTypes {
    NotificationEmailPreviewPage: typeof NotificationEmailPreviewPageComponent
  }
}

