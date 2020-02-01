import { Components, registerComponent } from 'meteor/vulcan:core';
import React from 'react';

const CoreSequences = () => {
  return <Components.CollectionsPage documentId={'oneQyj4pw77ynzwAF'} />
};

const CoreSequencesComponent = registerComponent('CoreSequences', CoreSequences);

declare global {
  interface ComponentTypes {
    CoreSequences: typeof CoreSequencesComponent
  }
}
