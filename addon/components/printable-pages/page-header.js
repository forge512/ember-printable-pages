import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
export default class PageHeader extends Component {
  @tracked shouldRender = true;
}
