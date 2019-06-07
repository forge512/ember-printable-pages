"use strict";

const getChannelURL = require("ember-source-channel-url");

module.exports = function() {
  return Promise.all([
    getChannelURL("release"),
    getChannelURL("beta"),
    getChannelURL("canary")
  ]).then(urls => {
    return {
      useYarn: true,
      scenarios: [
        {
          name: "ember-lts-2.18",
          command:
            "ember test --silent --reporter xunit > ~/ember/ember-lts-2.18.xml",
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              "jquery-integration": true
            })
          },
          npm: {
            devDependencies: {
              "@ember/jquery": "^0.5.1",
              "ember-source": "~2.18.0"
            }
          }
        },
        {
          name: "ember-lts-3.4",
          command:
            "ember test --silent --reporter xunit > ~/ember/ember-lts-3.4.xml",
          npm: {
            devDependencies: {
              "ember-source": "~3.4.0"
            }
          }
        },
        {
          name: "ember-lts-3.8",
          command:
            "ember test --silent --reporter xunit > ~/ember/ember-lts-3.8.xml",
          npm: {
            devDependencies: {
              "ember-source": "~3.8.0"
            }
          }
        },
        {
          name: "ember-release",
          command:
            "ember test --silent --reporter xunit > ~/ember/ember-release.xml",
          npm: {
            devDependencies: {
              "ember-source": urls[0]
            }
          }
        },
        {
          name: "ember-beta",
          command:
            "ember test --silent --reporter xunit > ~/ember/ember-beta.xml",
          npm: {
            devDependencies: {
              "ember-source": urls[1]
            }
          }
        },
        {
          name: "ember-canary",
          command:
            "ember test --silent --reporter xunit > ~/ember/ember-canary.xml",
          npm: {
            devDependencies: {
              "ember-source": urls[2]
            }
          }
        },
        // The default `.travis.yml` runs this scenario via `npm test`,
        // not via `ember try`. It's still included here so that running
        // `ember try:each` manually or from a customized CI config will run it
        // along with all the other scenarios.
        {
          name: "ember-default",
          command:
            "ember test --silent --reporter xunit > ~/ember/ember-default.xml",
          npm: {
            devDependencies: {}
          }
        },
        {
          name: "ember-default-with-jquery",
          command:
            "ember test --silent --reporter xunit > ~/ember/ember-default-with-jquery.xml",
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              "jquery-integration": true
            })
          },
          npm: {
            devDependencies: {
              "@ember/jquery": "^0.5.1"
            }
          }
        }
      ]
    };
  });
};
