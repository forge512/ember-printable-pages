# Upcoming

- Bug: Resolves Issue [#159](https://github.com/forge512/ember-printable-pages/issues/159) which caused the first page of Firefox to overflow in the demo app
- Bug: Fixes a bug causing Safari to scale the page down based on the width of your viewport when printing
- Documentation: Add notes about open browser compatibility issues and notes about how to set print menu settings for best results.
- Documentation: Add instructions for how to tell PrintablePages to rerender

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
