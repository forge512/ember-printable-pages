import Component from '@glimmer/component';
import { storageFor } from 'ember-local-storage';

export default class extends Component {
  @storageFor('print-settings') settings;
}
