import Component from "@glimmer/component";
import { isEmpty } from "@ember/utils";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { guidFor } from "@ember/object/internals";
import { scheduleOnce } from "@ember/runloop";
export default class Section extends Component {
  elementId = "ember-" + guidFor(this);

  shouldRender = true;
  id;
  section;

  constructor() {
    super(...arguments);
    if (!this.shouldRender) return;

    this.id = this.args.registerSection({
      data: this.args.data || [],
      columnCount: this.columnCount,
    });

    this.section = this.args.sectionMap[this.id];
  }

  get columnCount() {
    return Math.max(this.args.columnCount || 1, 1);
  }

  get hasOnlyBlock() {
    return isEmpty(this.args.data);
  }

  get page() {
    if (!this.section) return;
    return this.section.pages.at(this.args.pageIndexInChapter);
  }

  get items() {
    return this.section.data.slice(this.page.startIndex, this.page.endIndex + 1);
  }

  @action
  onUpdate() {
    let columnCountChanged = this.section?.columnCount != this.columnCount;
    let dataLengthChanged = this.args.data && this.section?.data?.length != this.args.data.length;
    if (this.shouldRender && (columnCountChanged || dataLengthChanged)) {
      console.log(`%c <section:${this.elementId} - ${this.id}> did-update --- rerendering`, "color: grey");
      this.args.triggerRerender();
    }
  }

  @action
  onInsert() {
    if (this.hasOnlyBlock) {
      console.log(`%c <section:${this.elementId} - ${this.id}> #onInsert -- has only block renderNext`, "color: grey");
      this.args.renderNext();
    }
  }
}
