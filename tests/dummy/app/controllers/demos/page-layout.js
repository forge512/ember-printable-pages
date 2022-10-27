import Controller from "@ember/controller";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

const PAGE_LAYOUTS = {
  "us-letter-portrait": {
    height: "11",
    width: "8.5",
  },
  "us-letter-landscape": {
    height: "8.5",
    width: "11",
  },
  "us-legal-portrait": {
    height: "14",
    width: "8.5",
  },
  "us-legal-landscape": {
    height: "8.5",
    width: "14",
  },
  "a4-portrait": {
    height: "11.69",
    width: "8.27",
  },
  "a4-landscape": {
    height: "8.27",
    width: "11.69",
  },
};

export default class extends Controller {
  @tracked pageHeight = "11";
  @tracked pageWidth = "8.5";
  @tracked pageSize = "us-letter-portrait";

  get pageLayoutOpts() {
    return Object.keys(PAGE_LAYOUTS);
  }

  @action
  updatePageLayout(event) {
    event.preventDefault();
    let pageLayout = PAGE_LAYOUTS[this.pageSize];
    this.pageHeight = pageLayout.height;
    this.pageWidth = pageLayout.width;
  }

  @action
  updatePageSize(event) {
    this.pageSize = event.target.value;
  }
}
