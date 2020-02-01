import React from 'react';
import PropTypes from 'prop-types';
import { registerComponent } from 'meteor/vulcan:core';
import Users from '../../lib/collections/users/collection';
import Button from '@material-ui/core/Button';
import classNames from 'classnames';
import { useCurrentUser } from '../common/withUser';

const commentFonts = '"freight-sans-pro", Frutiger, "Frutiger Linotype", Univers, Calibri, "Gill Sans", "Gill Sans MT", "Myriad Pro", Myriad, "DejaVu Sans Condensed", "Liberation Sans", "Nimbus Sans L", Tahoma, Geneva, "Helvetica Neue", Helvetica, Arial, sans-serif';

const styles = theme => ({
  formButton: {
    paddingBottom: "2px",
    fontFamily: commentFonts,
    fontSize: "16px",
    marginLeft: "5px",

    "&:hover": {
      background: "rgba(0,0,0, 0.05)",
    }
  },

  secondaryButton: {
    color: "rgba(0,0,0,0.4)",
  },

  submitButton: {
    color: theme.palette.secondary.main,
  },
});

const FormSubmit = ({
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  cancelCallback,
  document,
  deleteDocument,
  collectionName,
  classes,
},
{
  updateCurrentValues,
  addToDeletedValues
}) => {
  const currentUser = useCurrentUser();
  
  return <div className="form-submit">
    {collectionName === "posts" && <span className="post-submit-buttons">
      { !document.isEvent &&
        !document.meta &&
        Users.canDo(currentUser, 'posts.curate.all') && !document.question &&
          <Button
            type="submit"
            className={classNames(classes.formButton, classes.secondaryButton)}
            onClick={() => {
              updateCurrentValues({frontpageDate: document.frontpageDate ? null : new Date(), draft: false});
              if (document.frontpageDate) {
                addToDeletedValues('frontpageDate')
              }
            }}
          >
            {document.frontpageDate
              ? "Move to personal blog"
              : "Submit to frontpage" }
          </Button>}

      <Button
        type="submit"
        className={classNames(classes.formButton, classes.secondaryButton)}
        onClick={() => updateCurrentValues({draft: true})}
      >
        Save as draft
      </Button>

      {Users.canDo(currentUser, 'posts.curate.all') && !document.meta && !document.question &&
        <Button
          type="submit"
          className={classNames(classes.formButton, classes.secondaryButton)}
          onClick={() => {
            updateCurrentValues({curatedDate: document.curatedDate ? null : new Date()})
            if (document.curatedDate) {
              addToDeletedValues('curatedDate')
            }
          }}
        >
          {document.curatedDate
            ? "Remove from curated"
            : "Promote to curated"}
        </Button>
      }
    </span>}

    {!!cancelCallback &&
      <Button
        className={classNames("form-cancel", classes.formButton, classes.secondaryButton)}
        onClick={(e) => {
          e.preventDefault();
          cancelCallback(document)
        }}
      >
        {cancelLabel}
      </Button>
    }

    <Button
      type="submit"
      onClick={() => collectionName === "posts" && updateCurrentValues({draft: false})}
      className={classNames("primary-form-submit-button", classes.formButton, classes.submitButton)}
      variant={collectionName=="users" ? "outlined" : undefined}
    >
      {submitLabel}
    </Button>
  </div>
};

(FormSubmit as any).contextTypes = {
  updateCurrentValues: PropTypes.func,
  addToDeletedValues: PropTypes.func,
  addToSuccessForm: PropTypes.func,
  addToSubmitForm: PropTypes.func,
}


// Replaces FormSubmit from vulcan-forms.
const FormSubmitComponent = registerComponent('FormSubmit', FormSubmit, {styles});

declare global {
  interface ComponentTypes {
    FormSubmit: typeof FormSubmitComponent
  }
}
