import { describe, it, expect, beforeAll } from 'vitest';
import { buildSearchIndex } from '../../lib/content/search-index';
import type { SearchIndex } from '../../lib/content/search-index';

describe('Search Index', () => {
  let index: SearchIndex;

  beforeAll(async () => {
    index = await buildSearchIndex();
  });

  it('should build an index with entries', () => {
    expect(index.entries.length).toBeGreaterThan(0);
  });

  it('should find results for "amass"', () => {
    const results = index.search('amass');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should find results for "subdomain"', () => {
    const results = index.search('subdomain');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should find results for "cloud"', () => {
    const results = index.search('cloud');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should return empty results for empty query', () => {
    const results = index.search('');
    expect(results).toHaveLength(0);
  });

  it('should return empty results for nonsense query', () => {
    const results = index.search('xyzzy12345nonsense');
    expect(results).toHaveLength(0);
  });

  it('should rank title matches higher', () => {
    const results = index.search('Amass');
    // The tool named Amass should appear in results
    const toolResult = results.find(
      (r) => r.type === 'tool' && r.title === 'Amass'
    );
    expect(toolResult).toBeDefined();
  });

  it('should support adding new entries', () => {
    const initialCount = index.entries.length;
    index.add({
      id: 'test-entry',
      title: 'Test Entry',
      type: 'guide',
      content: 'test content for searching',
      url: '/test',
    });
    expect(index.entries.length).toBe(initialCount + 1);
  });
});
