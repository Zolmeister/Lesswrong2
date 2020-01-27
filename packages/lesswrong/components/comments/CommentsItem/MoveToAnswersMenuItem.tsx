import React, { PureComponent } from 'react';
import { registerComponent } from 'meteor/vulcan:core';
import { withUpdate } from '../../../lib/crud/withUpdate';
import { withMessages } from '../../common/withMessages';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import Users from 'meteor/vulcan:users';
import { Comments } from "../../../lib/collections/comments";
import withUser from '../../common/withUser';
import { withApollo } from 'react-apollo'

interface MoveToAnswersMenuItemProps extends WithMessagesProps, WithUserProps {
  comment: any,
  updateComment?: any,
  client?: any,
  post: any,
}
class MoveToAnswersMenuItem extends PureComponent<MoveToAnswersMenuItemProps,{}> {

  handleMoveToAnswers = async () => {
    const { comment, updateComment, client, flash } = this.props
    await updateComment({
      selector: { _id: comment._id},
      data: {
        answer: true,
      },
    })
    flash({id:"questions.comments.moved_to_answers"})
    client.resetStore()
  }

  handleMoveToComments = async () => {
    const { comment, updateComment, client, flash } = this.props
    await updateComment({
      selector: { _id: comment._id},
      data: {
        answer: false,
      },
    })
    flash({id:"questions.comments.moved_to_comments"})
    client.resetStore()
  }

  render() {
    const { currentUser, comment, post } = this.props
    if (!comment.topLevelCommentId && post.question &&
        (Users.canDo(currentUser, "comments.edit.all") || Users.owns(currentUser, comment))) {

        if (comment.answer) {
          return (
            <MenuItem onClick={this.handleMoveToComments}>
              Move To Comments
            </MenuItem>
          )
        } else {
          return (
            <MenuItem onClick={this.handleMoveToAnswers}>
              Move To Answers
            </MenuItem>
          )
        }
    } else {
      return null
    }
  }
}

const withUpdateOptions = {
  collection: Comments,
  fragmentName: 'CommentsList',
}

const MoveToAnswersMenuItemComponent = registerComponent('MoveToAnswersMenuItem', MoveToAnswersMenuItem, withUser, [withUpdate, withUpdateOptions], withApollo, withMessages);

declare global {
  interface ComponentTypes {
    MoveToAnswersMenuItem: typeof MoveToAnswersMenuItemComponent
  }
}