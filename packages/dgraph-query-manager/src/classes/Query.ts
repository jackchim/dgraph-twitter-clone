import logger from '../logger';
import { ParamType } from './ParamType';
import { http } from 'winston';

export enum HttpMethods {
  DELETE,
  GET,
  POST,
  PUT
}

export interface QueryInterface {
  httpMethod: HttpMethods;
  objectType: string;
  params: object;
  paramTypes?: ParamType<any>[];
  query: string;
  route: string;
  tree: string[][];
}

/**
 * Helper class for creating queries to be executed by Dgraph via dgraph-adapter.
 */
export class Query implements QueryInterface {
  private _objectType: string;
  get objectType(): string {
    // Set initial value if not specified.
    if (!this._objectType) this.objectType = this.getObjectTypeFromRoute();
    return this._objectType;
  }

  set objectType(value: string) {
    this._objectType = value;
  }

  private _params: object = {};
  get params(): object {
    return this._params;
  }

  set params(value: object) {
    this._params = value;
  }

  httpMethod: HttpMethods = HttpMethods.GET;
  paramTypes?: ParamType<any>[];
  query: string;
  route: string;
  tree: string[][] = [];

  /**
   * @param query - Query string.
   * @param route - API route.
   * @param paramTypes? - Collection of valid parameter types.
   * @param tree? - Results tree definition.
   * @param httpMethod
   */
  constructor(
    query: string,
    route: string,
    paramTypes?: ParamType<any>[],
    tree?: string | string[],
    httpMethod: HttpMethods = HttpMethods.GET
  ) {
    this.paramTypes = paramTypes;
    this.parseTree(tree);
    this.query = query;
    this.route = route;
    this.httpMethod = httpMethod;
  }

  /**
   * Parses the route string and obtains assumed retrieved object type.
   * e.g. '/tweets/:uid' returns 'tweets'
   */
  private getObjectTypeFromRoute(): string {
    const value = this.route.split('/')[1];
    return value ? value : 'Unknown';
  }

  /**
   * Splits the passed period-delimited tree string into array.
   * @param tree
   */
  private parseTree(tree?: string | string[]) {
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
  uri(params?: object): string | undefined {
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
   * @param params
   */
  injectCustomParams() {
    // this.params = params ? params : this.params;

    // Get all paramTypes that require substitution.
    const subParamTypes: ParamType<any>[] = this.paramTypes
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
   * @param params
   */
  validateParams() {
    const paramTypes = this.paramTypes;
    if (!this.params) {
      if (paramTypes) {
        logger.error(`No params found for query: ${this.query}`);
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
                logger.error(
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
            logger.error(
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
