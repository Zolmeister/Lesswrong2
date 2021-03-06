import { Components, registerComponent, getSetting } from '../../lib/vulcan-lib';
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Link } from '../../lib/reactRouterWrapper';
import Users from '../../lib/collections/users/collection';
import { withApollo } from 'react-apollo';

import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import SettingsIcon from '@material-ui/icons/Settings';
import EmailIcon from '@material-ui/icons/Email';
import NotesIcon from '@material-ui/icons/Notes';
import PersonIcon from '@material-ui/icons/Person';
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';

import { Posts } from '../../lib/collections/posts';
import withUser from '../common/withUser';
import withDialog from '../common/withDialog'
import withHover from '../common/withHover'
import {captureEvent} from "../../lib/analyticsEvents";

const styles = theme => ({
  root: {
    marginTop: 5,
    wordBreak: 'break-all',
    position: "relative"
  },
  userButtonRoot: {
    // Mui default is 16px, so we're halving it to bring it into line with the
    // rest of the header components
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit
  },
  userButtonContents: {
    textTransform: 'none',
    fontSize: '16px',
    fontWeight: 400,
  },
  notAMember: {
    marginLeft: 5,
    opacity: 0.9
  },
  icon: {
    color: theme.palette.grey[500]
  },
  deactivatedTooltip: {
    maxWidth: 230
  },
  deactivated: {
    color: theme.palette.grey[600],
    marginLeft: 20
  }
})

interface ExternalProps {
  color?: string,
}
interface UsersMenuProps extends ExternalProps, WithUserProps, WithStylesProps, WithDialogProps, WithHoverProps {
  client: any,
}
interface UsersMenuState {
  open: boolean,
  anchorEl: HTMLElement|null,
}

class UsersMenu extends PureComponent<UsersMenuProps,UsersMenuState> {
  constructor(props: UsersMenuProps) {
    super(props);
    this.state = {
      open: false,
      anchorEl: null,
    }
  }

  handleClick = (event) => {
    event.preventDefault();
    this.setState({
      open:true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  }

  render() {
    let { currentUser, client, classes, color, openDialog, hover, anchorEl } = this.props;

    const { LWPopper, LWTooltip } = Components

    if (!currentUser) return null;

    const showNewButtons = (getSetting('forumType') !== 'AlignmentForum' || Users.canDo(currentUser, 'posts.alignment.new')) && !currentUser.deleted
    const isAfMember = currentUser.groups && currentUser.groups.includes('alignmentForum')

    return (
      <div className={classes.root}>
        <Link to={`/users/${currentUser.slug}`}>
          <Button classes={{root: classes.userButtonRoot}}>
            <span className={classes.userButtonContents} style={{ color: color }}>
              {Users.getDisplayName(currentUser)}
              {currentUser.deleted && <LWTooltip title={<div className={classes.deactivatedTooltip}>
                <div>Your account has been deactivated:</div>
                <ul>
                  <li>Your username appears as '[Anonymous]' on comments/posts</li>
                  <li>Your profile page is not accessible</li>
                </ul>
              </div>}>
                <span className={classes.deactivated}>[Deactivated]</span>
              </LWTooltip>}
              {getSetting('forumType') === 'AlignmentForum' && !isAfMember && <span className={classes.notAMember}> (Not a Member) </span>}
            </span>
          </Button>
        </Link>
        <LWPopper
          open={hover}
          anchorEl={anchorEl}
          placement="bottom-start"
        >
          <Paper>
            {showNewButtons &&
              <MenuItem onClick={()=>openDialog({componentName:"NewQuestionDialog"})}>
                New Question
              </MenuItem>
            }
            {showNewButtons && <Link to={`/newPost`}>
                <MenuItem>New Post</MenuItem>
              </Link>
            }
            {showNewButtons &&
              <MenuItem onClick={()=>openDialog({componentName:"NewShortformDialog"})}>
                New Shortform
              </MenuItem>
            }
            {(showNewButtons && currentUser.karma >= 1000) &&
              <Link to={`/sequencesnew`}>
                <MenuItem>New Sequence</MenuItem>
              </Link>
            }
            {showNewButtons && <Divider/>}
            { getSetting('forumType') === 'AlignmentForum' && !isAfMember && <MenuItem onClick={() => openDialog({componentName: "AFApplicationForm"})}>
              Apply for Membership
            </MenuItem> }
            {!currentUser.deleted && <Link to={`/users/${currentUser.slug}`}>
              <MenuItem>
                <ListItemIcon>
                  <PersonIcon className={classes.icon}/>
                </ListItemIcon>
                User Profile
              </MenuItem>
            </Link>}
            <Link to={`/account`}>
              <MenuItem>
                <ListItemIcon>
                  <SettingsIcon className={classes.icon}/>
                </ListItemIcon>
                Edit Settings
              </MenuItem>
            </Link>
            <Link to={`/inbox`}>
              <MenuItem>
                <ListItemIcon>
                  <EmailIcon className={classes.icon}/>
                </ListItemIcon>
                Private Messages
              </MenuItem>
            </Link>
            {(currentUser.bookmarkedPostsMetadata?.length > 0) && <Link to={`/bookmarks`}>
              <MenuItem>
                <ListItemIcon>
                  <BookmarksIcon className={classes.icon}/>
                </ListItemIcon>
                Bookmarks
              </MenuItem>
            </Link>}
            {currentUser.shortformFeedId &&
              <Link to={Posts.getPageUrl({_id:currentUser.shortformFeedId, slug: "shortform"})}>
                <MenuItem>
                  <ListItemIcon>
                    <NotesIcon className={classes.icon} />
                  </ListItemIcon>
                  Shortform Page
                </MenuItem>
              </Link>
            }
            <Divider/>
            <MenuItem onClick={() => {
              captureEvent("logOutClicked")
              Meteor.logout(() => client.resetStore())
            }}>
              Log Out
            </MenuItem>
          </Paper>
        </LWPopper>
      </div>
    )
  }
}

(UsersMenu as any).propTypes = {
  color: PropTypes.string,
};

(UsersMenu as any).defaultProps = {
  color: "rgba(0, 0, 0, 0.6)"
}

const UsersMenuComponent = registerComponent<ExternalProps>('UsersMenu', UsersMenu, {
  styles,
  hocs: [withUser, withApollo, withHover(), withDialog]
});

declare global {
  interface ComponentTypes {
    UsersMenu: typeof UsersMenuComponent
  }
}
