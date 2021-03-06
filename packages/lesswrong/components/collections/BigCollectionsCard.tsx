import { Components, registerComponent } from '../../lib/vulcan-lib';
import React from 'react';
import { Link } from '../../lib/reactRouterWrapper';
import Typography from '@material-ui/core/Typography';
import { CoreReadingCollection } from '../sequences/CoreReading';

const styles = theme => ({
  root: {
    width:"100%",
    [theme.breakpoints.down('sm')]: {
      maxWidth: 347
    },
    "&:hover": {
      boxShadow: "0 0 5px rgba(0,0,0,.2)"
    },
  },
  card: {
    padding:theme.spacing.unit*2.5,
    display:"flex",
    height:310,
    flexWrap: "wrap",
    justifyContent: "space-between",
    [theme.breakpoints.down('sm')]: {
      height: "auto",
    },
  },
  content: {
    marginLeft: 40,
    marginBottom:theme.spacing.unit*2,
    width: "100%",
    maxWidth: 307,
    borderTop: "solid 4px black",
    paddingTop: theme.spacing.unit,
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
    }
  },
  text: {
    ...theme.typography.postStyle
  },
  author: {
    ...theme.typography.postStyle,
    marginBottom:theme.spacing.unit,
  },
  media: {
    height:271,
    width:307,
    [theme.breakpoints.down('sm')]: {
      width: "100%",
      maxWidth: 307,
      height: 90,
      order:2,
      overflow: "hidden"
    },
    '& img': {
      width:307,
      [theme.breakpoints.down('sm')]: {
        width: "100%",
        maxWidth: 307,
      }
    }
  }
})

const BigCollectionsCard = ({ collection, url, classes }: {
  collection: CoreReadingCollection,
  url: string,
  classes: ClassesType,
}) => {
  const { LinkCard, UsersName } = Components;
  const cardContentStyle = {borderTopColor: collection.color}

  return <LinkCard className={classes.root} to={url}>
    <div className={classes.card}>
      <div className={classes.media}>
        <Components.CloudinaryImage publicId={collection.imageId} />
      </div>
      <div className={classes.content} style={cardContentStyle}>
        <Typography variant="title" className={classes.title}>
          <Link to={url}>{collection.title}</Link>
        </Typography>
        <Typography variant="subheading" className={classes.author}>
          by <UsersName documentId={collection.userId}/>
        </Typography>
        <Typography variant="body2" className={classes.text}>
          {collection.summary}
        </Typography>
      </div>
    </div>
  </LinkCard>
}

const BigCollectionsCardComponent = registerComponent(
  "BigCollectionsCard", BigCollectionsCard, { styles }
);

declare global {
  interface ComponentTypes {
    BigCollectionsCard: typeof BigCollectionsCardComponent
  }
}
