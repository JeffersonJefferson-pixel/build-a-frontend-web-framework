const CATCH_ALL_ROUTES = '*';

export function makeRouteMatcher(route) {
    // create route matcher with param or without params based on path.
    return routeHasParams(route)
        ? makeMatcherWithParams(route)
        : makeMatcherWithoutParams(route);
}

function makeMatcherWithoutParams(route) {
    const regex = makeRouteWithoutParamsRegex(route);
    const isRedirect = typeof route.redirect === 'string';

    return {
        route,
        isRedirect,
        // check if regex match path
        checkMatch(path) {
            return regex.test(path);
        },
        // return empty because there are no params.
        extractParams() {
            return {}
        },
        extractQuery,
    }
}

function makeMatcherWithParams(route) {
    const regex = makeRouteWithParamsRegex(route);

    return {
        route,
        isRedirect,
        // check if regex match path
        checkMatch(path) {
            return regex.test(path);
        },
        // return empty because there are no params.
        extractParams(path) {
            const { groups } = regex.exec(path);
            return groups;
        },
        extractQuery,
    }
}

function makeRouteWithoutParamsRegex({ path }) {
    if (path === CATCH_ALL_ROUTES) {
        return new RegExp('^.*$');
    }

    return new RegExp(`^${path}$`);
}

function makeRouteWithParamsRegex({ path }) {
    // replace : param name pattern to named capture group. 
    const regex = path.replace(
        /:([^/]+)/g,
        (_, paramName) => `(?<${paramName}>[^/]+)`
    )

    return new RegExp(`^${regex}$`);
}

function routeHasParams({ path }) {
    return path.includes(':');
}

function extractQuery(path) {
    // check for question mark
    const queryIndex = path.indexOf('?');

    if (queryIndex === -1) {
        return {}
    }

    const search = new URLSearchParams(path.slice(queryIndex + 1));

    return Object.fromEntries(search.entries());
}