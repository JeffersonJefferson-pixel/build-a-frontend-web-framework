import { makeRouteMatcher  }  from "./route-matchers";

export class HashRouter {
    #matchers = [];
    #isInitialized = false;
    #matchedRoute = null;
    get matchedRoute() {
        return this.#matchedRoute;
    }
    #params = {};
    get params() {
        return this.#params;
    }
    #query = {};
    get query() {
        return this.#query;
    }
    #onPopState = () => this.#matchCurrentRoute();

    constructor(routes = []) {
        this.#matchers = routes.map(makeRouteMatcher);
    }

    // initialize router, attach event listeners
    async init() {
        // make sure to initialize only once.
        if (this.#isInitialized) {
            return;
        }

        // if no hash fragment, rplace browser history current state to #/
        if (document.location.hash === '') {
            window.history.replaceState({}, '', '#/');
        }

        // subscribe to popstate event.
        window.addEventListener('popstate', this.#onPopState);
        // match current route during initialization.
        await this.#matchCurrentRoute();
    }

    // destroy router, remove event listeners.
    destroy() {
        // make sure to destroy only after router is initialized.
        if (!this.#isInitialized) {
            return;
        }

        // remove event listener
        window.removeEventListener('popstate', this.#onPopState);

        this.#isInitialized = false;
    }

    // navigate to route with given path
    async navigateTo(path) {
        // find route that matches path.
        const matcher = this.#matchers.find((matcher) => matcher.checkMatch(path));

        if (matcher == null) {
            console.warn(`[Router] No route matches path "${path}"`);

            // clear if no match.
            this.#matchedRoute = null;
            this.#params = {};
            this.#query = {};

            return;
        }

        // recursively navigate to redirect path if route is a redirect.
        if (matcher.isRedirect) {
            return this.navigateTo(matcher.route.redirect);
        }

        // route guard
        const from = this.#matchedRoute;
        const to = matcher.route;
        const { shouldNavigate, shouldRedirect, redirectPath } = await this.#canChangeRoute(from, to);

        if (shouldRedirect) {
            return this.navigateTo(redirectPath);
        }

        if (shouldNavigate) {
            // save route, params, query
            this.#matchedRoute = matcher.route;
            this.#params = matcher.extractParams(path);
            this.#query = matcher.extractQuery(path);

            // push new path to browser history.
            this.#pushState(path);
        }
    }

    // go back in browser history
    back() {
        window.history.back();
    }

    // go forward in browser history
    forward() {
        window.history.forward();
    }

    #matchCurrentRoute() {
        return this.navigateTo(this.#currentRouteHash)
    }

    get #currentRouteHash() {
        // remove # prefix from route hash
        const hash = document.location.hash

        if (hash === '') {
            return '/';
        }

        return hash.slice(1);
    }

    #pushState(path) {
        window.history.pushState({}, '', `#${path}`);
    }

    async #canChangeRoute(from, to) {
        // get beforeEnter function in destination route. 
        const guard = to.beforeEnter;

        if (typeof guard !== 'function') {
            return {
                shouldRedirect: false,
                shouldNavigate: true,
                redirectPath: null,
            }
        }

        // evaluate guard function.
        const result = await guard(from?.path, to?.path);
        if (result === false) {
            return {
                shouldRedirect: false,
                shouldNavigate: false,
                redirectPath: null,
            }
        }

        if (typeof result === 'string') {
            return {
                shouldRedirect: true,
                shouldNavigate: false,
                redirectPath: result,
            } 
        }

        return {
            shouldRedirect: false,
            shouldNavigate: true,
            redirectPath: null,
        } 
    }
}