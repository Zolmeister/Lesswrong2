import { registerComponent, Components } from 'meteor/vulcan:core';
import React from 'react';
import { useHover } from '../common/withHover';

const EventVicinity = ({post}) => {
  const { eventHandlers, hover, anchorEl, stopHover } = useHover();
  const { LWPopper } = Components
  if (post.googleLocation && post.googleLocation.vicinity) {
    return <span {...eventHandlers}>
      <LWPopper 
        open={hover}
        anchorEl={anchorEl}
        onMouseEnter={stopHover}
        placement="top"
        tooltip
      >
        {post.location}
      </LWPopper>
      {post.googleLocation.vicinity}
    </span>
  } else {
    return <span {...eventHandlers}>{post.location}</span>
  }
};

const EventVicinityComponent = registerComponent('EventVicinity', EventVicinity, {})

declare global {
  interface ComponentTypes {
    EventVicinity: typeof EventVicinityComponent
  }
}
