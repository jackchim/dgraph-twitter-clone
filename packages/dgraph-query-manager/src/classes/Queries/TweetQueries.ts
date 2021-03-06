import { ParamType } from '../ParamType';
import { Query } from '../Query';
import { TypeOf } from '../TypeOf';

export const TweetQueries = {
  /**
   * Find a Tweet by Uid.
   */
  find: new Query(
    `query find($id: string) {
      data(func: uid($id)) {
        uid
        expand(_all_) {
          uid
          expand(_all_) 
        }
      }
     }`,
    '/tweet/:id',
    [new ParamType('$id', TypeOf(String))]
  ),

  /**
   * Get all Tweets.
   */
  getAll: new Query(
    `query {
      data(func: has (tweet.text)) {
        uid
        expand(_all_) {
          uid
          expand(_all_)
        }
      }
     }`,
    '/tweets'
  ),

  /**
   * Get first N Tweets.
   */
  getAllPaginated: new Query(
    `query find($count: int = 10) {
      data(func: has (tweet.text), first: $count) {
        uid
        expand(_all_) {
          uid
          expand(_all_)
        }
      }
     }`,
    '/tweets/:count',
    [new ParamType('$count', TypeOf(String))]
  ),

  /**
   * Get all Tweets created by User.
   */
  getAllForUser: new Query(
    `query find($id: string) {
      data(func: uid($id)) {
        tweets: ~tweet.user (orderdesc: tweet.createdAt) {
          uid
          expand(_all_) {
            uid
            expand(_all_)
          }
        }
      }
     }`,
    '/tweets/user/:id',
    [new ParamType('$id', TypeOf(String))],
    'data.tweets'
  ),

  /**
   * Get all Tweets that reply to specified Tweet Uid.
   */
  getReplies: new Query(
    `query find($id: string) {
      data(func: has(tweet.text)) {
        tweets: @filter(uid_in(tweet.inReplyToStatusId, $id)) {
          uid
          expand(_all_) {
            uid
            expand(_all_)
          }
        }
      }
    }`,
    `/tweet/:id/replies`,
    [new ParamType('$id', TypeOf(String))],
    'data.tweets'
  )
};
