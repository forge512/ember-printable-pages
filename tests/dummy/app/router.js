import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  this.route('demos', function() {
    // demo routes
    this.route('default');
    this.route('page-layout');
    this.route('title-page');
    this.route('large');
  });
  docsRoute(this, function() {
    // doc routes
    this.route('example');
  });
  this.route('not-found', { path: '/*path' });
});

export default Router;
