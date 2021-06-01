import { inject } from "inversify";
import { VNode } from "snabbdom/vnode";
import { InitializeCanvasBoundsAction, IUIExtension, ModelViewer } from "sprotty";
import { KeithFitToScreenAction } from "./actions/actions";
import { DISymbol } from "./di.symbols";

/**
 * Extend the {@link ModelViewer} to also dispatch a FitToScreenAction when the
 * window resizes.
 * Futhermore, the extension resolves UIExtensions from the IoC that should be
 * displayed immediately.
 */
export class KeithModelViewer extends ModelViewer {
    // Resolve UIExtensions that should be shown together with the model.
    // Such UIExtensions should implement a @postConstruct to show them self.
    // @ts-ignore value is never read. The IoC only has to resolve the dependency.
    @inject(DISymbol.OptionsTrigger) private optionsTrigger: IUIExtension;

    protected onWindowResize = (vdom: VNode): void => {
        // This should do a super.onWindowResize call to not repeat the logic from the
        // base class. However, the method is defined as an arrow function, which
        // technically is a function assigned to property and not a method.
        // Therefore, the call throws a TS2340 error.
        const baseDiv = document.getElementById(this.options.baseDiv);
        if (baseDiv !== null) {
            const newBounds = this.getBoundsInPage(baseDiv as Element);
            this.actiondispatcher.dispatch(new InitializeCanvasBoundsAction(newBounds));
            // TODO: Provide an option to toggle this on and off like it is done in KEITH Theia.
            this.actiondispatcher.dispatch(new KeithFitToScreenAction(false));
        }
    };
}