import { describe, expect, it } from 'vitest';

import {
  CREATE_ARTICLE,
  CREATE_COMMENT,
  DELETE_ARTICLE,
  INCREMENT_LIKE_COUNT,
  INCREMENT_VIEW_COUNT,
  TOGGLE_ARTICLE_STATUS,
  UPDATE_ARTICLE,
} from './mutations';

describe('Blog GraphQL Mutations', () => {
  it('CREATE_ARTICLE should be defined', () => {
    expect(CREATE_ARTICLE).toBeDefined();
    expect(CREATE_ARTICLE.loc?.source.body).toBeDefined();
  });

  it('UPDATE_ARTICLE should be defined', () => {
    expect(UPDATE_ARTICLE).toBeDefined();
    expect(UPDATE_ARTICLE.loc?.source.body).toBeDefined();
  });

  it('DELETE_ARTICLE should be defined', () => {
    expect(DELETE_ARTICLE).toBeDefined();
    expect(DELETE_ARTICLE.loc?.source.body).toBeDefined();
  });

  it('TOGGLE_ARTICLE_STATUS should be defined', () => {
    expect(TOGGLE_ARTICLE_STATUS).toBeDefined();
    expect(TOGGLE_ARTICLE_STATUS.loc?.source.body).toBeDefined();
  });

  it('INCREMENT_VIEW_COUNT should be defined', () => {
    expect(INCREMENT_VIEW_COUNT).toBeDefined();
    expect(INCREMENT_VIEW_COUNT.loc?.source.body).toBeDefined();
  });

  it('INCREMENT_LIKE_COUNT should be defined', () => {
    expect(INCREMENT_LIKE_COUNT).toBeDefined();
    expect(INCREMENT_LIKE_COUNT.loc?.source.body).toBeDefined();
  });

  it('CREATE_COMMENT should be defined', () => {
    expect(CREATE_COMMENT).toBeDefined();
    expect(CREATE_COMMENT.loc?.source.body).toBeDefined();
  });
});
