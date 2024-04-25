import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FoundryAppContext } from "./FoundryAppContext";
/**
 * Wrap an existing Foundry Application class in this Mixin to override the
 * normal rednering behaviour and and use React instead.
 */
export function ReactApplicationMixin(
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
   * */
  render,
) {
  class Reactified extends Base {
    constructor() {
      super(...arguments);
      /**
       * when true, we've called `_injectHTML` or `_replaceHTML` at least once.
       */
      this.isDOMInitialized = false;
      this.serial = 0;
    }
    /**
     * Override _replaceHTML to stop FVTT's standard template lifecycle coming in
     * and knackering React on every update.
     * @see {@link Application._replaceHTML}
     * @override
     */
    _replaceHTML(element, html) {
      // this is a very specific hack for Foundry v11. In
      // `Application#_activateCoreListeners` it assumes that `html` (which is
      // actually a jQuery object) has been injected into the DOM, so it tries
      // to call `.parentElement` on it. However we are blocking the call to
      // `_replaceHTML` (here, where you're reading this) so it doesn't bugger
      // up React, which means that `html` just contains a free-floating
      // unattached DOM node with no `.parentElement`. So this hack is just that
      // we wrap it in a div to keep Foundry's internals happy.
      //
      // The alternative might be to override `_activateCoreListeners` but
      // there's an alarming cautionary comment on it saying basically don't do
      // that. TBH that probably applies more to normal apps rather than this
      // Reactified system, but this hack seems more targetted anyway.
      html.wrap("<div/>");
      // in some circumstances, _injectHTML never gets called, so we need to let
      // this method (_replaceHTML) have it's normal effect once in that case.
      if (!this.isDOMInitialized) {
        super._replaceHTML(element, html);
        this.isDOMInitialized = true;
      }
      // this is the only other thing we need to do here - react deals with
      // updating the rest of the window.
      element.find(".window-title").text(this.title);
    }
    /**
     * Override _injectHTML to set our domInitialized flag.
     */
    _injectHTML(html) {
      this.isDOMInitialized = true;
      super._injectHTML(html);
    }
    /**
     * We need to pick somewhere to activate and render React. It would have
     * been nice to do this from `render` & friends but they happen before
     * there's a DOM element. `activateListeners` at least happens *after* the
     * DOM has been created.
     * @override
     */
    activateListeners(html) {
      // we were previously calling super.activateListeners(html) here
      // leaving this comment in case it help with future debugging.
      const target = $(this.element).find(".react-target");
      const parent = target.closest(".window-content");
      if (this.options.resizable) {
        parent.addClass("resizable");
      } else {
        parent.addClass("non-resizable");
      }
      const el = target.get(0);
      if (el) {
        const content = (
          <StrictMode>
            <FoundryAppContext.Provider
              value={this}
              key={"FoundryAppContextProvider"}
            >
              {render(this, this.serial)}
            </FoundryAppContext.Provider>
          </StrictMode>
        );
        if (!this.reactRoot) {
          this.reactRoot = createRoot(el);
        }
        this.reactRoot.render(content);
        this.serial += 1;
      }
    }
    async close(options) {
      if (this.reactRoot) {
        this.reactRoot.unmount();
        this.reactRoot = undefined;
      }
      return super.close(options);
    }
  }
  // see comment on name arg above
  Object.defineProperty(Reactified, "name", {
    value: name,
  });
  return Reactified;
}
