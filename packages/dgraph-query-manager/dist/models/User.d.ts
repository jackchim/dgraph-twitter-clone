import { BaseModel, BaseModelInterface, Tweet } from '../models';
export interface UserInterface extends BaseModelInterface {
  'user.avatar': string;
  'user.createdAt': Date | string;
  'user.description'?: string;
  'user.email': string;
  'user.favorites': Tweet[];
  'user.friends': User[];
  'user.location'?: string;
  'user.name': string;
  'user.retweets': Tweet[];
  'user.screenName': string;
  'user.url'?: string;
}
export declare class User extends BaseModel<User> implements UserInterface {
  /**
   * User avatar url.
   * @type{string}
   */
  'user.avatar': string;
  /**
   * UTC time when this User was created.
   * @type {Date}
   */
  'user.createdAt': Date;
  /**
   * The user-defined UTF-8 string describing their account.
   * @type {?string}
   */
  'user.description'?: string;
  /**
   * Email address of this user.
   * @type {string}
   */
  'user.email': string;
  /**
   * Favorited Tweets.
   */
  'user.favorites': Tweet[];
  /**
   * Users that are being followed.
   */
  'user.friends': User[];
  /**
   * The user-defined location for this account’s profile. Not necessarily a location, nor machine-parseable.
   * @type {?string}
   */
  'user.location'?: string;
  /**
   * The key of the user, as they’ve defined it.
   * @type {string}
   */
  'user.name': string;
  /**
   * Tweets that have been retweeted.
   */
  'user.retweets': Tweet[];
  /**
   * The screen key, handle, or alias that this user identifies themselves with.
   * @type {string}
   */
  'user.screenName': string;
  /**
   * A URL provided by the user in association with their profile.
   * @type {?string}
   */
  'user.url'?: string;
  constructor(params?: Partial<User>);
  /**
   * Deserialize User object.
   * @param params
   */
  static deserialize<User>(params?: Partial<User | any>): Partial<User>;
  /**
   * Generates a User instance for testing.
   * @param seed
   * @param params
   */
  static generate(seed?: number, params?: Partial<User>): User;
  /**
   * Generates a mockup User object for testing.
   * @param seed
   * @param params
   */
  static generateFakeParams(
    seed?: number,
    params?: Partial<User>
  ): Partial<User>;
  /**
   * Generates a valid random username.
   */
  private static generateValidUsername;
  /**
   * Performs all steps of async User creation.
   * @param {Partial<User>} params
   * @returns {Promise<User<Tweet>>}
   */
  static load(params?: Partial<User>): Promise<Partial<User>>;
}
