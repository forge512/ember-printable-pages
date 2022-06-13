import Component from "@glimmer/component";
import { htmlSafe } from "@ember/template";
import { later, next, schedule } from "@ember/runloop";
import { inject as service } from "@ember/service";
import { isBlank, isPresent } from "@ember/utils";
import { getOwner } from "@ember/application";
import { action } from "@ember/object";
import { guidFor } from "@ember/object/internals";
import { tracked } from "@glimmer/tracking";

export default class ChapterPage extends Component {
  elementId = "ember-" + guidFor(this);

  @service documentData;
  @tracked lastRenderedItemId;
  @tracked element;

  // INTERNAL STATE
  sectionRegistrationIndex = 0;

  // Register the section if this page is the first in the chapter.
  // Return the section index in the page as the section's id. This
  // is the unique id for the section across all pages.
  @action
  registerSection(data) {
    let id = this.sectionRegistrationIndex;
    if (this.args.pageIndexInChapter === 0) {
      this.args.registerSection(id, data);
    }

    console.log(`reg index: ${this.sectionRegistrationIndex}`);
    this.sectionRegistrationIndex = this.sectionRegistrationIndex + 1;
    return id;
  }

  @action didInsert(element) {
    this.element = element;
  }

  @action
  setLastRenderedItem(elementId) {
    this.lastRenderedItemId = elementId;
  }
}
