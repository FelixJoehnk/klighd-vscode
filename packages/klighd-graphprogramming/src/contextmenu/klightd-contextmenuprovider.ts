
import { injectable } from 'inversify';
import { Anchor, IContextMenuService, MenuItem } from 'sprotty';

@injectable()
export class ContextMenueProvider implements IContextMenuService{
    protected containerElement: HTMLElement;
    protected activeElement: Element | null;

    show(items: MenuItem[], anchor: Anchor, onHide?: (() => void) | undefined): void {
        console.log("test");
    }
}