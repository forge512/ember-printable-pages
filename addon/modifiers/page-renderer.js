import Modifier from "ember-modifier";
import { task, timeout, waitForProperty } from "ember-concurrency";
import { isBlank, isPresent } from "@ember/utils";
import { later, next, schedule } from "@ember/runloop";
import { getOwner } from "@ember/application";

export default class PageRenderer extends Modifier {
  modify(element, positionalArgs, namedArgs) {
    console.log("------ modifier:page-renderer modify ----", element);
    if (!this.pageElement) {
      this.pageElement = element;
      this.onPageRendered = namedArgs.onPageRendered;
      this.setBodyHeight();
    }
  }

  get pageBodyElement() {
    return this.pageElement.querySelector(".js-page-body");
  }

  get visibilityTailElement() {
    return this.pageElement.querySelector(".js-visibility-tail");
  }

  get pageBreakElement() {
    return this.pageElement.querySelector(".js-page-break-after");
  }

  setBodyHeight() {
    console.log("modifier:page-renderer setBodyHeight", this.pageElement);
    // The first render is used to measure the header and footer height
    // and set the page body to fixed height (in this component's
    // onInsert hook). If the bodyElement hasn't been set
    // to a fixed height yet then wait before checking for overflow.

    let topOfBreakAfter = this.pageBreakElement.getBoundingClientRect().top;
    let topOfElement = this.pageElement.getBoundingClientRect().top;
    let wrapperHeight = topOfBreakAfter - topOfElement;
    // The ember test environment scales the page down by 50%
    let config = getOwner(this).resolveRegistration("config:environment");
    if (config.environment === "test") wrapperHeight = wrapperHeight * 2;

    wrapperHeight = Math.ceil(wrapperHeight);
    // Use height based on parent (100%) so that parent owns the overall page height

    // Set the body to a fixed height
    this.pageBodyElement.style.height = `calc(100% - ${wrapperHeight}px)`;
  }
}
