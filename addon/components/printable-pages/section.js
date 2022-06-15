import Component from "@glimmer/component";
import { isEmpty } from "@ember/utils";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";

export default class Section extends Component {
  @tracked shouldRender = true;
  @tracked id;

  constructor() {
    super(...arguments);
    if (!this.shouldRender) return;

    this.id = this.args.registerSection({
      data: this.args.data || [],
      columnCount: this.args.columnCount || 1,
    });
  }

  get section() {
    return this.args.sectionMap[this.id];
  }

  get hasOnlyBlock() {
    return isEmpty(this.args.data);
  }

  get page() {
    if (!this.section) return;
    return this.section.pages.at(this.args.pageIndexInChapter);
  }

  get items() {
    let { startIndex, endIndex } = this.page;
    return this.section.data.slice(startIndex, endIndex + 1);
  }

  @action
  onUpdate() {
    console.log(`%c <section:${this.elementId}> did-update`, "color: grey");
    let columnCountChanged = this.section?.columnCount != this.args.columnCount;
    let dataLengthChanged =
      this.section?.data?.length != this.args.data?.length;

    if (this.shouldRender && (columnCountChanged || dataLengthChanged)) {
      this.args.triggerRerender();
    }
  }

  @action
  onInsert() {
    console.log(`%c <section:${this.id}> did-insert`, "color: grey");
    if (this.hasOnlyBlock) this.args.renderNext();
  }
}
