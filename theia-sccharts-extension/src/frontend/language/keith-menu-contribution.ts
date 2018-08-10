import { Command, MenuContribution, MenuModelRegistry } from '@theia/core/lib/common';
import { injectable } from 'inversify';
import { CommonMenus } from '@theia/core/lib/browser';


/**
 * Show SCCharts references
 */
export const SHOW_SCCHARTS_REFERENCES: Command = {
    id: 'sccharts.show.references'
};

/**
 * Apply Workspace Edit
 */
export const APPLY_WORKSPACE_EDIT: Command = {
    id: 'sccharts.apply.workspaceEdit'
};

export const SHOW_NEXT: Command = {
    id: 'show_next',
    label: 'Show next'
}
export const SHOW_PREVIOUS: Command = {
    id: 'show_previous',
    label: 'Show previous'
}
export const COMPILER: Command = {
    id: 'compiler:toggle',
    label: 'Compiler'
}

@injectable()
export class KeithMenuContribution implements MenuContribution {

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.VIEW_VIEWS, {
            commandId: COMPILER.id
        });
    }
}