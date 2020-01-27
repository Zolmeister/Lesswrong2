import { registerComponent } from 'meteor/vulcan:core';
import { withSingle } from '../../lib/crud/withSingle';
import React, { Component } from 'react';
import { Link } from '../../lib/reactRouterWrapper';
import { Localgroups } from '../../lib/index';
import { withStyles, createStyles } from '@material-ui/core/styles';

const styles = createStyles(theme => ({
  title: {
    display: 'inline-block',
    fontSize: 22,
    verticalAlign: '-webkit-baseline-middle',
    fontVariant: 'small-caps',
    lineHeight: '24px',
    color: 'rgba(0,0,0,0.5)',
    marginTop: -10,
  },
  root: {
    marginBottom: 10, 
    marginTop: 10
  }
}))

const PostsGroupDetails = ({ post, classes, document }) => {
  if (document) {
    return <div className={classes.root}>
      <div className={classes.title}>
        {post && post.groupId && <Link to={'/groups/' + post.groupId }>{ document.name }</Link>}
      </div>
    </div>
  } else {
    return null
  }
}

const options = {
  collection: Localgroups,
  queryName: "PostsGroupDetailsQuery",
  fragmentName: 'localGroupsHomeFragment',
  enableTotal: false,
  ssr: true,
}

const PostsGroupDetailsComponent = registerComponent('PostsGroupDetails', PostsGroupDetails, [withSingle, options], withStyles(styles, {name: "PostsGroupDetails"}));

declare global {
  interface ComponentTypes {
    PostsGroupDetails: typeof PostsGroupDetailsComponent
  }
}
