import Modifier from "ember-modifier";
import { task, timeout, waitForProperty } from "ember-concurrency";
import { tracked } from "@glimmer/tracking";
import { isBlank, isPresent } from "@ember/utils";
import { later, next, schedule } from "@ember/runloop";
import { getOwner } from "@ember/application";

export default class PageRenderer extends Modifier {
  @tracked namedArgs = null;
  @tracked element = null;

  modify(element, positionalArgs, namedArgs) {
    console.log("------ modifier:page-renderer modify ----", element);
    this.element = element;
    this.setBodyHeight();
  }

  get pageElement() {
    return this.element;
  }

  get pageBodyElement() {
    return this.element.querySelector(".js-page-body");
  }

  get visibilityTailElement() {
    return this.element.querySelector(".js-visibility-tail");
  }

  get pageBreakElement() {
    return this.element.querySelector(".js-page-break-after");
  }

  setBodyHeight() {
    console.log("modifier:page-renderer setBodyHeight", this.element);
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
