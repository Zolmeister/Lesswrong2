import React, { PureComponent } from 'react';
import { registerComponent } from 'meteor/vulcan:core';
import { withUpdate } from '../../../lib/crud/withUpdate';
import { withMessages } from '../../common/withMessages';
import MenuItem from '@material-ui/core/MenuItem';
import Users from 'meteor/vulcan:users';
import withUser from '../../common/withUser';
import * as _ from 'underscore';

interface BanUserFromAllPersonalPostsMenuItemProps extends WithMessagesProps, WithUserProps {
  comment: any,
  updateUser?: any,
  post: any,
}

class BanUserFromAllPersonalPostsMenuItem extends PureComponent<BanUserFromAllPersonalPostsMenuItemProps,{}> {
  handleBanUserFromAllPosts = (event) => {
    const { currentUser, comment, flash, updateUser } = this.props;
    if (!currentUser) return;
    event.preventDefault();
    if (confirm("Are you sure you want to ban this user from commenting on all your personal blog posts?")) {
      const commentUserId = comment.userId
      let bannedPersonalUserIds = _.clone(currentUser.bannedPersonalUserIds) || []
      if (!bannedPersonalUserIds.includes(commentUserId)) {
        bannedPersonalUserIds.push(commentUserId)
      }
      updateUser({
        selector: { _id: currentUser._id },
        data: {bannedPersonalUserIds:bannedPersonalUserIds},
      }).then(()=>flash({messageString: `User ${comment.user.displayName} is now banned from commenting on any of your personal blog posts`}))
    }
  }

  render() {
    const { currentUser, post } = this.props
    if (Users.canModeratePost(currentUser, post) && !post.frontpageDate && Users.owns(currentUser, post)) {
        return <MenuItem onClick={ this.handleBanUserFromAllPosts }>
          Ban from all your personal blog posts
        </MenuItem>
      } else {
        return null
      }
  }
}

const withUpdateOptions = {
  collection: Users,
  fragmentName: 'UsersProfile',
};


const BanUserFromAllPersonalPostsMenuItemComponent = registerComponent('BanUserFromAllPersonalPostsMenuItem', BanUserFromAllPersonalPostsMenuItem, withMessages, [withUpdate, withUpdateOptions], withUser);

declare global {
  interface ComponentTypes {
    BanUserFromAllPersonalPostsMenuItem: typeof BanUserFromAllPersonalPostsMenuItemComponent,
  }
}
