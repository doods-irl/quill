import Quill from '../core/quill.js';
import Toolbar, { type ToolbarProps } from './toolbar.js';

/**
 * SharedToolbar allows multiple Quill editors to share a single toolbar.
 * The toolbar will operate on the editor that is currently focused.
 */
export default class SharedToolbar {
  toolbar: Toolbar;
  active: Quill;
  updateHandler: () => void;

  constructor(
    editors: Quill[],
    options: Partial<ToolbarProps> & { container: HTMLElement | string },
  ) {
    if (editors.length === 0) {
      throw new Error('SharedToolbar requires at least one editor');
    }
    this.toolbar = new Toolbar(editors[0], options);
    this.active = editors[0];
    this.updateHandler = () => {
      const [range] = this.active.selection.getRange();
      this.toolbar.update(range);
    };
    this.active.off(Quill.events.EDITOR_CHANGE, this.updateHandler);
    this.active.on(Quill.events.EDITOR_CHANGE, this.updateHandler);

    editors.forEach((editor) => {
      editor.on(Quill.events.SELECTION_CHANGE, (range, _old, source) => {
        if (range && source === Quill.sources.USER) {
          this.setActiveEditor(editor);
        }
      });
    });
  }

  setActiveEditor(editor: Quill) {
    if (this.active === editor) return;
    this.active.off(Quill.events.EDITOR_CHANGE, this.updateHandler);
    this.toolbar.quill = editor;
    this.active = editor;
    this.active.on(Quill.events.EDITOR_CHANGE, this.updateHandler);
    this.updateHandler();
  }
}
