import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FoundryAppContext } from "./FoundryAppContext";
/**
 * Wrap an existing Foundry Application class in this Mixin to override the
 * normal rednering behaviour and and use React instead.
 */
export function ReactApplicationV2Mixin(
/**
 * Name to be attached to the created class. This is needed because minified
 * classes have weird names which can break foundry when thney get used as
 * HTML ids.
 */
name, 
/**
 * The base class.
 */
Base, 
/** A function which will be given an *instance* of Base and expected to
 * return some JSX.
 */
render) {
    class Reactified extends Base {
        constructor() {
            super(...arguments);
            /**
             * A serial number to keep track of how many times we've rendered. This is
             * just for debugging.
             */
            this.serial = 0;
        }
        // METHODS
        // From Atropos: _renderFrame only occurs once and is the most natural point
        // (given the current API) to bind the content div to your react component.
        async _renderFrame(options) {
            const element = await super._renderFrame(options);
            const target = this.hasFrame
                ? element.querySelector(".window-content")
                : element;
            if (target) {
                this.reactRoot = createRoot(target);
            }
            return element;
        }
        // _renderHTML is the semantically appropriate place to render updates to
        // the HTML of the app... or in our case, to ask to react to refresh.
        _renderHTML() {
            const content = (<StrictMode>
          <FoundryAppContext.Provider value={this} key={"FoundryAppContextProvider"}>
            {render(this, this.serial)}
          </FoundryAppContext.Provider>
        </StrictMode>);
            this.reactRoot?.render(content);
            this.serial += 1;
        }
        // This override should be optional eventually but rn is needed to prevent
        // foundry throwing a wobbly
        _replaceHTML(result, content, options) { }
    }
    Reactified.DEFAULT_OPTIONS = {
        ...foundry.applications.api.ApplicationV2.DEFAULT_OPTIONS,
        window: {
            ...foundry.applications.api.ApplicationV2.DEFAULT_OPTIONS.window,
            frame: true,
            title: name,
        },
    };
    // see comment on name arg above
    Object.defineProperty(Reactified, "name", { value: name });
    return Reactified;
}
