import Component from '@glimmerer/component';

export default class TableOfContents extends Component {
  get chapterMeta() {
    return this.args.chapters.map((c) => ({
      startPage: c.startPage,
      endPage: c.endPage,
      name: c.name,
      isToc: c.isToc,
    }));
  }

  get chapterMetaWithoutToc() {
    return this.chapterMeta.filter((c) => !c.isToc);
  }
}
