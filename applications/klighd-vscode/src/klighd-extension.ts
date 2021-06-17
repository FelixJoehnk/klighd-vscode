/*
 * KIELER - Kiel Integrated Environment for Layout Eclipse RichClient
 *
 * http://rtsys.informatik.uni-kiel.de/kieler
 *
 * Copyright 2021 by
 * + Kiel University
 *   + Department of Computer Science
 *     + Real-Time and Embedded Systems Group
 *
 * This code is provided under the terms of the Eclipse Public License (EPL).
 */
import {
    KeithFitToScreenAction,
    RefreshDiagramAction,
    RefreshLayoutAction,
} from "klighd-core";
import { CenterAction, RequestExportSvgAction } from "sprotty";
import { SprottyWebview } from "sprotty-vscode";
import { ActionHandler } from "sprotty-vscode/lib/action-handler";
import { SprottyDiagramIdentifier, SprottyLspVscodeExtension } from "sprotty-vscode/lib/lsp";
import { commands, ExtensionContext, Uri } from "vscode";
import { LanguageClient } from "vscode-languageclient";
import { command, diagramType, extensionId } from "./constants";
import { KLighDWebview } from "./klighd-webview";

/** Options required to construct a KLighDExtension */
interface KLighDExtensionOptions {
    lsClient: LanguageClient;
    supportedFileEnding: string[];
}

/**
 * Type definition for a class that implements an {@link ActionHandler}.
 * Corresponds to the expected type of `sprotty-vscode` for `SprottyWebview.addActionHandler`.
 */
export type ActionHandlerClass = new (webview: SprottyWebview) => ActionHandler;

/**
 * Bootstrap an extension with `sprotty-vscode` that manages a webview which
 * contains a Sprotty container to display diagrams.
 *
 * @see https://github.com/eclipse/sprotty-vscode
 */
export class KLighDExtension extends SprottyLspVscodeExtension {
    // SprottyLspVscodeExtension calls "activateLanguageClient" in its constructor
    // to receive a language client that is used for the diagrams and register
    // event handlers on the client.
    // We have to store our given client somewhere so it is available for "activateLanguageClient"
    // to return. Using a instance property does not work because the super() call
    // in the constructor, and therefore the "activateLanguageClient" call, has to happen
    // before modifications to the instance. The only possible hack around this
    // problem is a static property.
    // PS. This hack is approved by als.
    private static lsClient: LanguageClient;
    private supportedFileEndings: string[];

    /**
     * Stored action handlers that where registered by another extension.
     * They are added to the web views created for their languageclient.
     */
    private actionHandlers: ActionHandlerClass[];

    constructor(context: ExtensionContext, options: KLighDExtensionOptions) {
        // The static property has to be set before super is called. Otherwise,
        // the Sprotty glue-code has no language client.
        KLighDExtension.lsClient = options.lsClient;
        super(extensionId, context);

        this.supportedFileEndings = options.supportedFileEnding;
        this.actionHandlers = [];
    }

    addActionHandler(handler: ActionHandlerClass): void {
        this.actionHandlers.push(handler);
    }

    protected createWebView(identifier: SprottyDiagramIdentifier): SprottyWebview {
        const webview = new KLighDWebview({
            extension: this,
            identifier,
            localResourceRoots: [this.getExtensionFileUri("dist")],
            scriptUri: this.getExtensionFileUri("dist", "webview.js"),
            singleton: true,
        });

        for (const handler of this.actionHandlers) {
            webview.addActionHandler(handler);
        }

        return webview;
    }

    /**
     * `commandArgs` are the args passed to the diagram open command.
     * Only returning a diagramType for support fileEndings (defined by host extension)
     * prevents the webview content from changing if an unsupported editor is focused,
     * while the diagram view is open.
     *
     * For example: Focusing the output/task panel causes the webview to update and
     * trying to render a model in the clearly unsupported situation.
     */
    protected getDiagramType(commandArgs: any[]): string | Promise<string | undefined> | undefined {
        if (commandArgs[0] instanceof Uri && this.pathHasSupportedFileEnding(commandArgs[0].path)) {
            return diagramType;
        }
        return undefined;
    }

    private pathHasSupportedFileEnding(path: string) {
        return this.supportedFileEndings.some((ending) => path.endsWith(ending));
    }

    protected activateLanguageClient(): LanguageClient {
        // This extension does not manage any language clients. It receives it's
        // clients from a host extension. See the "setLanguageClient" command.
        return KLighDExtension.lsClient;
    }

    /**
     * Overwrite register from {@link SprottyLspVscodeExtension} commands to
     * fix zooming problems with diagram.fit when an element is selected.
     *
     * _Note: This can not call the super implementation since VSCode is not able
     * to overwrite commands and would throw an error._
     */
    protected registerCommands(): void {
        this.context.subscriptions.push(
            commands.registerCommand(command.diagramOpen, async (...commandArgs: any[]) => {
                const identifier = await this.createDiagramIdentifier(commandArgs);
                if (identifier) {
                    const key = this.getKey(identifier);
                    let webView = this.singleton || this.webviewMap.get(key);
                    if (webView) {
                        webView.reloadContent(identifier);
                        webView.diagramPanel.reveal(webView.diagramPanel.viewColumn);
                    } else {
                        webView = this.createWebView(identifier);
                        this.webviewMap.set(key, webView);
                        if (webView.singleton) {
                            this.singleton = webView;
                        }
                    }
                }
            })
        );
        this.context.subscriptions.push(
            commands.registerCommand(command.diagramCenter, () => {
                const activeWebview = this.findActiveWebview();
                if (activeWebview) {
                    activeWebview.dispatch(new CenterAction([], true));
                }
            })
        );
        this.context.subscriptions.push(
            commands.registerCommand(command.diagramFit, () => {
                const activeWebview = this.findActiveWebview();
                if (activeWebview) {
                    activeWebview.dispatch(new KeithFitToScreenAction(true));
                }
            })
        );
        this.context.subscriptions.push(
            commands.registerCommand(command.diagramLayout, () => {
                const activeWebview = this.findActiveWebview();
                if (activeWebview) {
                    console.log("Called!!!");
                    activeWebview.dispatch(new RefreshLayoutAction());
                }
            })
        );
        this.context.subscriptions.push(
            commands.registerCommand(command.diagramRefresh, () => {
                const activeWebview = this.findActiveWebview();
                if (activeWebview) {
                    console.log("Called!!!");
                    activeWebview.dispatch(new RefreshDiagramAction());
                }
            })
        );
        this.context.subscriptions.push(
            commands.registerCommand(command.diagramExport, () => {
                const activeWebview = this.findActiveWebview();
                if (activeWebview) {
                    activeWebview.dispatch(new RequestExportSvgAction());
                }
            })
        );
    }
}