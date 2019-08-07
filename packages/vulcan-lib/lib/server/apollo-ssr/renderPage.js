/**
 * Render the page server side
 * @see https://github.com/szomolanyi/MeteorApolloStarter/blob/master/imports/startup/server/ssr.js
 * @see https://github.com/apollographql/GitHunt-React/blob/master/src/server.js
 * @see https://www.apollographql.com/docs/react/features/server-side-rendering.html#renderToStringWithData
 */
import React from 'react';
import ReactDOM from 'react-dom/server';
import { getDataFromTree } from 'react-apollo';
import { computeContextFromReq } from '../apollo-server/context.js';

import { runCallbacks } from '../../modules/callbacks';
import { createClient } from './apolloClient';

import Head from './components/Head';
import ApolloState from './components/ApolloState';
import AppGenerator from './components/AppGenerator';

const makePageRenderer = async sink => {
  const req = sink.request;
  // according to the Apollo doc, client needs to be recreated on every request
  // this avoids caching server side
  const client = await createClient(await computeContextFromReq(req));

  // Used by callbacks to handle side effects
  // E.g storing the stylesheet generated by styled-components
  const context = {};

  // Allows components to set statuscodes and redirects that will get executed on the server
  let serverRequestStatus = {}

  // TODO: req object does not seem to have been processed by the Express
  // middlewares at this point
  // @see https://github.com/meteor/meteor-feature-requests/issues/174#issuecomment-441047495

  const App = <AppGenerator req={req} apolloClient={client} serverRequestStatus={serverRequestStatus} />;

  // run user registered callbacks that wraps the React app
  const WrappedApp = runCallbacks({
    name: 'router.server.wrapper',
    iterator: App,
    properties: { req, context, apolloClient: client },
  });

  let htmlContent = '';
  // LESSWRONG: Split a call to renderToStringWithData into getDataFromTree
    // followed by ReactDOM.renderToString, then pass a context variable
    // isGetDataFromTree to only the getDataFromTree call. This is to enable
    // a hack in packages/lesswrong/server/material-ui/themeProvider.js.
    //
    // In getDataFromTree, the order in which components are rendered is
    // complicated and depends on what HoCs they have and the order in which
    // results come back from the database; whereas in
    // ReactDOM.renderToString, the render order is simply an inorder
    // traversal of the resulting virtual DOM. When the client rehydrates the
    // SSR, it traverses inorder, like renderToString did.
    //
    // Ordinarily the render order wouldn't matter, except that material-UI
    // JSS stylesheet generation happens on first render, and it generates
    // some class names which contain an iterating counter, which needs to
    // match between client and server.
    //
    // So the hacky solution is: when rendering for getDataFromTree, we pass
    // a context variable isGetDataFromTree, and if that's present and true,
    // we suppress JSS style generation.
  try {
    await getDataFromTree(WrappedApp, {isGetDataFromTree: true});
  } catch(err) {
    console.error(`Error while fetching Apollo Data. date: ${new Date().toString()} url: ${JSON.stringify(req.url)}`); // eslint-disable-line no-console
    console.error(err);
  }
  try {
    htmlContent = await ReactDOM.renderToString(WrappedApp);
  } catch (err) {
    console.error(`Error while rendering React tree. date: ${new Date().toString()} url: ${JSON.stringify(req.url)}`); // eslint-disable-line no-console
    console.error(err);
  }

  if(serverRequestStatus.status) {
    sink.setStatusCode(serverRequestStatus.status)
  }
  if(serverRequestStatus.redirectUrl) {
    if (!serverRequestStatus.status) console.warn("No redirect status set, defaulting to 301")
    sink.redirect(serverRequestStatus.redirectUrl, serverRequestStatus.status || 301)
  }

  // TODO: there should be a cleaner way to set this wrapper
  // id must always match the client side start.jsx file
  const wrappedHtmlContent = `<div id="react-app">${htmlContent}</div>`;
  sink.appendToBody(wrappedHtmlContent);
  // TODO: this sounds cleaner but where do we add the <div id="react-app"> ?
  //sink.renderIntoElementById('react-app', content)

  // add headers using helmet
  const head = ReactDOM.renderToString(<Head />);
  sink.appendToHead(head);

  // add Apollo state, the client will then parse the string
  const initialState = client.extract();
  const serializedApolloState = ReactDOM.renderToString(
    <ApolloState initialState={initialState} />
  );
  sink.appendToBody(serializedApolloState);

  // post render callback
  runCallbacks({
    name: 'router.server.postRender',
    iterator: sink,
    properties: { context },
  });
};

export default makePageRenderer;
