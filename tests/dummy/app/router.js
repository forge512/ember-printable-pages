import AddonDocsRouter, { docsRoute } from "ember-cli-addon-docs/router";
import config from "dummy/config/environment";

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURLe,
});

Router.map(function () {
  this.route("demo");

  this.route("demos", function () {
    // acceptance test
    this.route("large");
    this.route("title-page");
    this.route("page-layout");
  });

  docsRoute(this, function () {
    this.route("installation");
    this.route("getting-started");
    this.route("limitations");
    this.route("layout-customization");
    this.route("rerendering");
    this.route("title-pages");
    this.route("page-numbers");
    this.route("table-of-contents");
    this.route("continued-sections");
    this.route("render-progress");
  });

  this.route("test-routes", function () {
    this.route("configurable");
  });

  this.route("not-found", { path: "/*path" });
});

export default Router;
