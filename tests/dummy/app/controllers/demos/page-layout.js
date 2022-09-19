import Controller from "@ember/controller";
import { later } from "@ember/runloop";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

const PAGE_LAYOUTS = {
  "us-letter-portrait": {
    height: "11in",
    width: "8.5in",
  },
  "us-letter-landscape": {
    height: "8.5in",
    width: "11in",
  },
  "us-legal-portrait": {
    height: "14in",
    width: "8.5in",
  },
  "us-legal-landscape": {
    height: "8.5in",
    width: "14in",
  },
  "a4-portrait": {
    height: "11.69in",
    width: "8.27in",
  },
  "a4-landscape": {
    height: "8.27in",
    width: "11.69in",
  },
};

export default class extends Controller {
  @tracked pageHeight = "11in";
  @tracked pageWidth = "8.5in";
  @tracked pageSize = "us-letter-portrait";
  @tracked marginSize = 0.5;
  @tracked hidePages = false;

  get pageLayoutOpts() {
    return Object.keys(PAGE_LAYOUTS);
  }

  get pageMargins() {
    return `${this.marginSize}in`;
  }

  @action
  updatePageLayout(_event) {
    _event.preventDefault();
    let pageLayout = PAGE_LAYOUTS[this.pageSize];
    this.pageHeight = pageLayout.height;
    this.pageWidth = pageLayout.width;
    this.hidePages = true;

    later(
      this,
      () => {
        this.hidePages = false;
      },
      10
    );
  }
}
