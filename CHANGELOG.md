# 1.0.0

### Breaking Changes
- Increased minimum Node version to 16
- Previously changing the value of any argument on the top level `<PrintablePages>` would trigger a whole document re-render. This has been replaced by a single argument, `@trackedForRefresh`. It accepts a single value or a hash. Updates to the value or hash will trigger a full re-render of the document

### Updates
- ***Refactor to use Octane features `@tracked`, element modifiers, etc***
- Upgrade to Ember 3.28
- Upgrade Circle CI config to modern node 16 image
- Disable tests for Ember 3.24 and below because they fail on CI. 3.24 at least passes locally and in actual projects.
- Transition from `babel-eslint` to `@babel/eslint-parser`
- Add `.tool-versions` for the asdf fans out there


# 0.7.2

- Bug: In some rare cases component:chapter-page would check for overflow before the page body element was given a fixed height. This could cause blank pages or the rendering of an infinite number of pages in some cases."

# 0.7.1

- Bug: Remove stray debug div that was added to the table of contents component in v0.7.0

# 0.7.0

- Feature: Add table of contents component [#226](https://github.com/forge512/ember-printable-pages/pull/226)

## Breaking Changes

- None!

# 0.6.0

- Feature: Add layout customizations

## Breaking Changes

- Bug: Fix bug in tests which caused the inner (printable) page height to be too large. This was caused by math issues due to the ember test environment scaling the test window. This will change how many items fit in a page during test which can break existing tests.


# 0.5.2

- Bug: Fix typo in demo app [#213](https://github.com/forge512/ember-printable-pages/issues/213)

# 0.5.1

- Bug: Hide header when printing the home page of the docs [#212](https://github.com/forge512/ember-printable-pages/pull/212)
- Upgrade ember-test-selectors [#211](https://github.com/forge512/ember-printable-pages/pull/211)


# 0.5.0

- Bug: Resolves Issue [#159](https://github.com/forge512/ember-printable-pages/issues/159) which caused the first page of Firefox to overflow in the demo app
- Bug: Fixes a bug causing Safari to scale the page down based on the width of your viewport when printing
- Documentation: Add notes about open browser compatibility issues and notes about how to set print menu settings for best results.
- Documentation: Add instructions for how to tell PrintablePages to rerender
- Bug: Fixed a bug causing PrintablePages to hang or skip rendering some sections when rendering full page sections [PR #193](https://github.com/forge512/ember-printable-pages/pull/193)

## Breaking Changes

- Drop support for Ember <3.7

# 0.4.0

- Upgrade misc dependencies
- Documentation!

## Breaking Changes

- `component:section` now yields 3 params `data`, `index`, and `indexInPage` this mirrors how `each` behaves. Previously it yielded a hash with `data` and `index` keys.


# 0.3.0

- Upgrade to Ember 3.12
- Upgrade other dependencies
- Improve test coverage
- Update section's isFullRendered property when moving section items to the next page [#151](https://github.com/forge512/ember-printable-pages/pull/151)

## Breaking Changes

- Drop Node 8 support
