import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { addGraphQLCollection, addToGraphQLContext } from './graphql';
import { Utils } from './utils';
import { runCallbacks } from './callbacks';
import { getSetting, registerSetting } from './settings';
import { registerFragment, getDefaultFragmentText } from './fragments';
import { Collections } from './getCollection';
export * from './getCollection';
import * as _ from 'underscore';
import { Meteor } from 'meteor/meteor';

const wrapAsync = Meteor.wrapAsync ? Meteor.wrapAsync : Meteor._wrapAsync;
// import { debug } from './debug';

registerSetting('maxDocumentsPerRequest', 5000, 'Maximum documents per request');

// When used in a view, set the query so that it returns rows where a field is
// null or is missing. Equivalent to a searech with mongo's `field:null`, except
// that null can't be used this way within Vulcan views because it's ambiguous
// between searching for null/missing, vs overriding the default view to allow
// any value.
export const viewFieldNullOrMissing = {nullOrMissing:true};

// When used in a view, set the query so that any value for this field is
// permitted, overriding constraints from the default view if they exist.
export const viewFieldAllowAny = {allowAny:true};

// TODO: find more reliable way to get collection name from type name?
export const getCollectionName = typeName => Utils.pluralize(typeName);

// TODO: find more reliable way to get type name from collection name?
export const getTypeName = (collectionName: CollectionNameString) => collectionName.slice(0, -1);

/**
 * @summary replacement for Collection2's attachSchema. Pass either a schema, to
 * initialize or replace the schema, or some fields, to extend the current schema
 * @class Mongo.Collection
 */
Mongo.Collection.prototype.attachSchema = function(schemaOrFields) {
  if (schemaOrFields instanceof SimpleSchema) {
    this.simpleSchema = () => schemaOrFields;
  } else {
    this.simpleSchema().extend(schemaOrFields);
  }
};

/**
 * @summary Add an additional field (or an array of fields) to a schema.
 * @param {Object|Object[]} field
 */
Mongo.Collection.prototype.addField = function(fieldOrFieldArray) {
  const collection = this;
  const schema = collection.simpleSchema()._schema;
  const fieldSchema = {};

  const fieldArray = Array.isArray(fieldOrFieldArray) ? fieldOrFieldArray : [fieldOrFieldArray];

  // loop over fields and add them to schema (or extend existing fields)
  fieldArray.forEach(function(field) {
    const newField = {...schema[field.fieldName], ...field.fieldSchema};
    fieldSchema[field.fieldName] = newField;
  });

  // add field schema to collection schema
  collection.attachSchema(fieldSchema);
};

/**
 * @summary Remove a field from a schema.
 * @param {String} fieldName
 */
Mongo.Collection.prototype.removeField = function(fieldName) {
  var collection = this;
  var schema = _.omit(collection.simpleSchema()._schema, fieldName);

  // add field schema to collection schema
  collection.attachSchema(new SimpleSchema(schema));
};

/**
 * @summary Add a default view function.
 * @param {Function} view
 */
Mongo.Collection.prototype.addDefaultView = function(view) {
  this.defaultView = view;
};

/**
 * @summary Add a named view function.
 * @param {String} viewName
 * @param {Function} view
 */
Mongo.Collection.prototype.addView = function(viewName, view) {
  this.views[viewName] = view;
};

/**
 * @summary Allow mongodb aggregation
 * @param {Array} pipelines mongodb pipeline
 * @param {Object} options mongodb option object
 */
Mongo.Collection.prototype.aggregate = function(pipelines, options) {
  var coll = this.rawCollection();
  return wrapAsync(coll.aggregate.bind(coll))(pipelines, options);
};

// see https://github.com/dburles/meteor-collection-helpers/blob/master/collection-helpers.js
Mongo.Collection.prototype.helpers = function(helpers) {
  var self = this;

  if (self._transform && !self._helpers)
    throw new Meteor.Error(
      "Can't apply helpers to '" + self._name + "' a transform function already exists!"
    );

  if (!self._helpers) {
    self._helpers = function Document(doc) {
      return _.extend(this, doc);
    };
    self._transform = function(doc) {
      return new self._helpers(doc);
    };
  }

  _.each(helpers, function(helper, key) {
    self._helpers.prototype[key] = helper;
  });
};

export const createCollection = (options: any): any => {
  const {
    typeName,
    collectionName = getCollectionName(typeName),
    schema,
    generateGraphQLSchema = true,
    dbCollectionName,
  } = options;

  // initialize new Mongo collection
  const collection =
    collectionName === 'Users' && Meteor.users
      ? Meteor.users
      : new Mongo.Collection(dbCollectionName ? dbCollectionName : collectionName.toLowerCase());

  // decorate collection with options
  collection.options = options;

  // add typeName if missing
  collection.typeName = typeName;
  collection.options.typeName = typeName;
  collection.options.singleResolverName = Utils.camelCaseify(typeName);
  collection.options.multiResolverName = Utils.camelCaseify(Utils.pluralize(typeName));

  // add collectionName if missing
  collection.collectionName = collectionName;
  collection.options.collectionName = collectionName;

  // add views
  collection.views = [];

  if (schema) {
    // attach schema to collection
    collection.attachSchema(new SimpleSchema(schema));
  }

  // add collection to resolver context
  const context = {};
  context[collectionName] = collection;
  addToGraphQLContext(context);

  if (generateGraphQLSchema) {
    // add collection to list of dynamically generated GraphQL schemas
    addGraphQLCollection(collection);
  }

  // ------------------------------------- Default Fragment -------------------------------- //

  const defaultFragment = getDefaultFragmentText(collection);
  if (defaultFragment) registerFragment(defaultFragment);

  // ------------------------------------- Parameters -------------------------------- //

  collection.getParameters = (terms = {}, apolloClient, context) => {
    // console.log(terms);

    let parameters: any = {
      selector: {},
      options: {},
    };

    if (collection.defaultView) {
      parameters = Utils.deepExtend(
        true,
        parameters,
        collection.defaultView(terms, apolloClient, context)
      );
    }

    // handle view option
    if (terms.view && collection.views[terms.view]) {
      const viewFn = collection.views[terms.view];
      const view = viewFn(terms, apolloClient, context);
      let mergedParameters = Utils.deepExtend(true, parameters, view);

      if (
        mergedParameters.options &&
        mergedParameters.options.sort &&
        view.options &&
        view.options.sort
      ) {
        // If both the default view and the selected view have sort options,
        // don't merge them together; take the selected view's sort. (Otherwise
        // they merge in the wrong order, so that the default-view's sort takes
        // precedence over the selected view's sort.)
        mergedParameters.options.sort = view.options.sort;
      }
      parameters = mergedParameters;
    }

    // iterate over posts.parameters callbacks
    parameters = runCallbacks(
      `${typeName.toLowerCase()}.parameters`,
      parameters,
      _.clone(terms),
      apolloClient,
      context
    );
    // OpenCRUD backwards compatibility
    parameters = runCallbacks(
      `${collectionName.toLowerCase()}.parameters`,
      parameters,
      _.clone(terms),
      apolloClient,
      context
    );

    // sort using terms.orderBy (overwrite defaultView's sort)
    if (terms.orderBy && !_.isEmpty(terms.orderBy)) {
      parameters.options.sort = terms.orderBy;
    }

    // if there is no sort, default to sorting by createdAt descending
    if (!parameters.options.sort) {
      parameters.options.sort = { createdAt: -1 };
    }

    // extend sort to sort posts by _id to break ties, unless there's already an id sort
    // NOTE: always do this last to avoid overriding another sort
    if (!(parameters.options.sort && typeof parameters.options.sort._id !== undefined)) {
      parameters = Utils.deepExtend(true, parameters, { options: { sort: { _id: -1 } } });
    }

    // remove any null fields (setting a field to null means it should be deleted)
    _.keys(parameters.selector).forEach(key => {
      if (_.isEqual(parameters.selector[key], viewFieldNullOrMissing)) {
        parameters.selector[key] = null;
      } else if (_.isEqual(parameters.selector[key], viewFieldAllowAny)) {
        delete parameters.selector[key];
      } else if (parameters.selector[key] === null) {
        //console.log(`Warning: Null key ${key} in query of collection ${collectionName} with view ${terms.view}.`);
        delete parameters.selector[key];
      }
    });
    if (parameters.options.sort) {
      _.keys(parameters.options.sort).forEach(key => {
        if (parameters.options.sort[key] === null) {
          delete parameters.options.sort[key];
        }
      });
    }

    // limit number of items to 1000 by default
    const maxDocuments = getSetting('maxDocumentsPerRequest', 5000);
    const limit = terms.limit || parameters.options.limit;
    parameters.options.limit = !limit || limit < 1 || limit > maxDocuments ? maxDocuments : limit;

    // console.log(parameters);

    return parameters;
  };

  Collections.push(collection);

  return collection;
};
