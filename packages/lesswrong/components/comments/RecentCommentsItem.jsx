import { Components, getRawComponent, registerComponent } from 'meteor/vulcan:core';
import React from 'react';
import classNames from 'classnames';
import withErrorBoundary from '../common/withErrorBoundary'
import { withStyles } from '@material-ui/core/styles'
import { legacyBreakpoints } from '../../lib/modules/utils/theme';

const styles = theme => ({
  author: {
    ...theme.typography.body2,
    fontWeight: 600,
    marginRight: 10
  },
  authorAnswer: {
    fontFamily: theme.typography.postStyle.fontFamily
  },
  usernameSpacing: {
    paddingRight: 1,
    color: "rgba(0,0,0,.3)",
    [legacyBreakpoints.maxSmall]: {
      padding: "0 10px",
    }
  }
})

class RecentCommentsItem extends getRawComponent('CommentsItem') {
  constructor(props) {
    super(props);
    this.state = {
      showReply: false,
      showEdit: false,
      expanded: false,
      showParent: false
    };
  }

  toggleShowParent = () => {
    this.setState({showParent:!this.state.showParent})
  }

  render() {
    const { comment, showTitle, level=1, truncated, collapsed, classes } = this.props;
    const { showEdit } = this.state

    if (comment && comment.post) {
      return (
        <div
          className={classNames(
            'comments-node',
            'recent-comments-node',
            {
              "comments-node-root" : level === 1,
              "comments-node-even" : level % 2 === 0,
              "comments-node-odd"  : level % 2 != 0,
              "showParent": this.state.showParent,
            }
          )}>
          { comment.parentCommentId && this.state.showParent && (
            <div className="recent-comment-parent">
              <Components.RecentCommentsSingle
                currentUser={this.props.currentUser}
                documentId={comment.parentCommentId}
                level={level + 1}
                expanded={true}
                key={comment.parentCommentId}
              />
            </div>
          )}

          <div className="comments-item">
            <div className="comments-item-body recent-comments-item-body ">
              <div className="comments-item-meta recent-comments-item-meta">
                { comment.parentCommentId
                  ? <Components.ShowParentComment
                      comment={comment} nestingLevel={level}
                      active={this.state.showParent}
                      onClick={this.toggleShowParent}
                    />
                  : (level != 1) && <div className={classes.usernameSpacing}>○</div>
                }
                <span className={classNames(classes.author, {[classes.authorAnswer]:comment.answer})}>
                  {comment.answer && "Answer by "}<Components.UsersName user={comment.user}/>
                </span>
                {comment.post &&
                  <Components.CommentsItemDate
                    comment={comment} post={comment.post}
                    showPostTitle={showTitle}
                    scrollOnClick={false}
                  />
                }
                <Components.CommentsVote comment={comment} currentUser={this.props.currentUser} />
                { level === 1 && this.renderMenu() }
              </div>
              { showEdit ?
                <Components.CommentsEditForm
                  comment={this.props.comment}
                  successCallback={this.editSuccessCallback}
                  cancelCallback={this.editCancelCallback}
                />
                :
                <Components.CommentBody
                  truncated={truncated}
                  collapsed={collapsed}
                  comment={comment}
                />
              }
            </div>
          </div>
          {this.state.showReply ? this.renderReply() : null}
        </div>
      )
    } else {
      return <div className="comments-node recent-comments-node loading">
        <Components.Loading />
      </div>
    }
  }
}

registerComponent('RecentCommentsItem', RecentCommentsItem, withErrorBoundary, withStyles(styles, {name:'RecentCommentsItem'}));