import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";

export default class PageFooter extends Component {
  @tracked shouldRender = true;
}
