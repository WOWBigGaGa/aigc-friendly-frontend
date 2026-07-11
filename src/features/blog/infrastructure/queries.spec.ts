import { describe, expect, it } from 'vitest';

import {
  GET_ARCHIVES,
  GET_ARTICLE_BY_ID,
  GET_ARTICLES,
  GET_ARTICLES_BY_CATEGORY,
  GET_ARTICLES_BY_TAG,
  GET_CATEGORIES,
  GET_COMMENTS,
  GET_TAGS,
  SEARCH_ARTICLES,
} from './queries';

describe('Blog GraphQL Queries', () => {
  it('GET_ARTICLES should be defined', () => {
    expect(GET_ARTICLES).toBeDefined();
    expect(GET_ARTICLES.loc?.source.body).toBeDefined();
  });

  it('GET_ARTICLE_BY_ID should be defined', () => {
    expect(GET_ARTICLE_BY_ID).toBeDefined();
    expect(GET_ARTICLE_BY_ID.loc?.source.body).toBeDefined();
  });

  it('GET_CATEGORIES should be defined', () => {
    expect(GET_CATEGORIES).toBeDefined();
    expect(GET_CATEGORIES.loc?.source.body).toBeDefined();
  });

  it('GET_TAGS should be defined', () => {
    expect(GET_TAGS).toBeDefined();
    expect(GET_TAGS.loc?.source.body).toBeDefined();
  });

  it('SEARCH_ARTICLES should be defined', () => {
    expect(SEARCH_ARTICLES).toBeDefined();
    expect(SEARCH_ARTICLES.loc?.source.body).toBeDefined();
  });

  it('GET_ARTICLES_BY_CATEGORY should be defined', () => {
    expect(GET_ARTICLES_BY_CATEGORY).toBeDefined();
    expect(GET_ARTICLES_BY_CATEGORY.loc?.source.body).toBeDefined();
  });

  it('GET_ARTICLES_BY_TAG should be defined', () => {
    expect(GET_ARTICLES_BY_TAG).toBeDefined();
    expect(GET_ARTICLES_BY_TAG.loc?.source.body).toBeDefined();
  });

  it('GET_ARCHIVES should be defined', () => {
    expect(GET_ARCHIVES).toBeDefined();
    expect(GET_ARCHIVES.loc?.source.body).toBeDefined();
  });

  it('GET_COMMENTS should be defined', () => {
    expect(GET_COMMENTS).toBeDefined();
    expect(GET_COMMENTS.loc?.source.body).toBeDefined();
  });
});
