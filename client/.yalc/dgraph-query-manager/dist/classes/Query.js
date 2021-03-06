'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const logger_1 = require('../logger');
var HttpMethods;
(function(HttpMethods) {
  HttpMethods[(HttpMethods['DELETE'] = 0)] = 'DELETE';
  HttpMethods[(HttpMethods['GET'] = 1)] = 'GET';
  HttpMethods[(HttpMethods['POST'] = 2)] = 'POST';
  HttpMethods[(HttpMethods['PUT'] = 3)] = 'PUT';
})((HttpMethods = exports.HttpMethods || (exports.HttpMethods = {})));
/**
 * Helper class for creating queries to be executed by Dgraph via dgraph-adapter.
 */
class Query {
  /**
   * @param query - Query string.
   * @param route - REST_API route.
   * @param paramTypes? - Collection of valid parameter types.
   * @param tree? - Results tree definition.
   * @param httpMethod
   * @param params
   */
  constructor(
    query,
    route,
    paramTypes,
    tree,
    httpMethod = HttpMethods.GET,
    params
  ) {
    this.httpMethod = HttpMethods.GET;
    this.tree = [];
    this.paramTypes = paramTypes;
    this.parseTree(tree);
    this.query = query;
    this.route = route;
    this.httpMethod = httpMethod;
    if (params) this.params = params;
  }
  get objectType() {
    // Set initial value if not specified.
    if (!this._objectType) this.objectType = this.getObjectTypeFromRoute();
    return this._objectType;
  }
  set objectType(value) {
    this._objectType = value;
  }
  /**
   * Builds a Query instance from partial params.
   * @param params
   */
  static factory(params) {
    return new Query(
      params.query,
      params.route,
      params.paramTypes,
      undefined,
      params.httpMethod,
      params.params
    );
  }
  /**
   * Parses the route string and obtains assumed retrieved object type.
   * e.g. '/tweets/:uid' returns 'tweets'
   */
  getObjectTypeFromRoute() {
    const value = this.route.split('/')[1];
    return value ? value : 'Unknown';
  }
  /**
   * Splits the passed period-delimited tree string into array.
   * @param tree
   */
  parseTree(tree) {
    if (!tree) return;
    if (tree instanceof Array) {
      for (const element of tree) {
        this.tree.push(element.split('.'));
      }
    } else if (typeof tree === 'string') {
      this.tree.push(tree.split('.'));
    }
  }
  /**
   * Generates the proper URI from route and passed params.
   * @param params
   */
  uri(params) {
    let newUri = this.route;
    if (params) {
      // replace $ in params with :
      Object.entries(params).forEach(([key, value]) => {
        newUri = newUri.replace(key.replace('$', ':'), value);
      });
    }
    return newUri;
  }
  /**
   * Injects custom params into query strings.  Useful for 'building' queries at runtime.
   */
  injectCustomParams() {
    // Get all paramTypes that require substitution.
    const subParamTypes = this.paramTypes
      ? this.paramTypes.filter(paramType => paramType.isSubstitution === true)
      : [];
    subParamTypes.forEach(paramType => {
      // Replace key value in param with param value.
      this.query = this.query.replace(
        paramType.key,
        this.params[paramType.key]
      );
      // Remove from params prior to Dgraph mutation submission.
      delete this.params[paramType.key];
    });
  }
  /**
   * Validates passed params with specified paramTypes, if applicable.
   */
  validateParams() {
    const paramTypes = this.paramTypes;
    if (!this.params) {
      if (paramTypes) {
        logger_1.default.error(`No params found for query: ${this.query}`);
        return false;
      }
    } else {
      if (paramTypes) {
        paramTypes.forEach(paramType => {
          // Check that params contain this paramType key.
          if (this.params.hasOwnProperty(paramType.key)) {
            // Skip undefined or null
            if (this.params[paramType.key]) {
              // Checks that constructor type of parameter matches paramType.
              if (
                this.params[paramType.key].constructor.name !==
                paramType.type.constructor.name
              ) {
                logger_1.default.error(
                  `Param for key of (${
                    paramType.key
                  }) must match constructor paramType of (${
                    paramType.type.constructor.name
                  }).`
                );
                return false;
              }
            }
          } else {
            logger_1.default.error(
              `Params must contain paramType key of (${paramType.key}).`
            );
            return false;
          }
        });
      }
    }
    return true;
  }
}
exports.Query = Query;

//# sourceMappingURL=Query.js.map
