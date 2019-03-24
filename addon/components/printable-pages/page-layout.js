import Component from '@ember/component';
import layout from '../../templates/components/printable-pages/page-layout';
import { htmlSafe } from "@ember/template";

export default Component.extend({
  layout,
  tagName: '',
  pageStyles: '',

  // LIFECYCLE HOOKS
  didInsertElement() {
    this.set(
      'pageStyles',
      htmlSafe(
        `height:${this.pageLayout.height};` +
        `width:${this.pageLayout.width};` +
        `padding:${this.pageLayout.margins};`
      )
    );
  },
});
