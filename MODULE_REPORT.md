## Module Report
### Unknown Global

**Global**: `Ember.testing`

**Location**: `addon/components/printable-pages.js` at line 117

```js

  reportStartTask: task(function*(currentPage) {
    if (Ember.testing && !this._isRendering) {
      this._isRendering = true;
      registerWaiter(() => !this._isRendering);
```
