import { Components, registerComponent } from 'meteor/vulcan:core';
import React from 'react';

const PostsLoading = props => {
  return <div className="posts-load-more-loading"><Components.Loading/></div>
};

const PostsLoadingComponent = registerComponent('PostsLoading', PostsLoading);

declare global {
  interface ComponentTypes {
    PostsLoading: typeof PostsLoadingComponent
  }
}
