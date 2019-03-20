import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';

const PAGE_LAYOUTS = {
  'us-letter-portrait': {
    height: '11in',
    width: '8.5in',
  },
  'us-letter-landscape': {
    height: '8.5in',
    width: '11in',
  },
  'us-legal-portrait': {
    height: '14in',
    width: '8.5in',
  },
  'us-legal-landscape': {
    height: '8.5in',
    width: '14in',
  },
  'a4-portrait': {
    height: '11.69in',
    width: '8.27in',
  },
  'a4-landscape': {
    height: '8.27in',
    width: '11.69in',
  },
};

export default Controller.extend({
  pageHeight: '11in',
  pageWidth: '8.5in',

  pageSize: 'us-letter-portrait',
  pageLayoutOpts: computed(function() {
    return Object.keys(PAGE_LAYOUTS);
  }),

  marginSize: 0.5,
  pageMargins: computed('marginSize', function() {
    return `${this.marginSize}in`;
  }),

  actions: {
    updatePageLayout(_event) {
      _event.preventDefault();
      let pageLayout = PAGE_LAYOUTS[this.pageSize];
      this.setProperties({
        pageHeight: pageLayout.height,
        pageWidth: pageLayout.width,
        hidePages: true,
      });
      run.later(this, () => {
        this.set('hidePages', false);
      }, 10);
    }
  }
});
