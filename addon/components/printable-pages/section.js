import Component from "@glimmer/component";
import { htmlSafe } from "@ember/template";
import { isEmpty } from "@ember/utils";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";

export default class Section extends Component {
  @tracked shouldRender = true;
  @tracked columnCount = 1;
  @tracked id;

  constructor() {
    super(...arguments);
    if (!this.shouldRender) return;

    this.id = this.args.registerSection({
      data: this.args.data || [],
      columnCount: this.columnCount,
    });
  }

  get section() {
    return this.args.sectionMap?.[this.id];
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
    let columnCountChanged = this.section?.columnCount != this.columnCount;
    let dataLengthChanged =
      this.section?.data?.length != this.args.data?.length;

    if (this.shouldRender && (columnCountChanged || dataLengthChanged)) {
      this.args.triggerRerender();
    }
  }
}
