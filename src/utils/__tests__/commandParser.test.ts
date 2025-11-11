import { describe, it, expect } from 'bun:test';
import { parseCommandInput, getCommandPart, isValidCommandInput } from '../commandParser';

describe('commandParser - Real WikiJS TUI Commands', () => {
  describe('parseCommandInput', () => {
    // Test actual TUI commands
    it('should parse pages command', () => {
      const result = parseCommandInput('/pages');
      expect(result).toEqual({
        command: 'pages',
        args: '',
        isComplete: true
      });
    });

    it('should parse search command with query', () => {
      const result = parseCommandInput('/search news');
      expect(result).toEqual({
        command: 'search',
        args: 'news',
        isComplete: true
      });
    });

    it('should parse search command with multi-word query', () => {
      const result = parseCommandInput('/search TLS deployment guide');
      expect(result).toEqual({
        command: 'search',
        args: 'TLS deployment guide',
        isComplete: true
      });
    });

    it('should parse delete command', () => {
      const result = parseCommandInput('/delete');
      expect(result).toEqual({
        command: 'delete',
        args: '',
        isComplete: true
      });
    });

    it('should parse compare command', () => {
      const result = parseCommandInput('/compare');
      expect(result).toEqual({
        command: 'compare',
        args: '',
        isComplete: true
      });
    });

    it('should parse copy command', () => {
      const result = parseCommandInput('/copy');
      expect(result).toEqual({
        command: 'copy',
        args: '',
        isComplete: true
      });
    });

    it('should parse status command', () => {
      const result = parseCommandInput('/status');
      expect(result).toEqual({
        command: 'status',
        args: '',
        isComplete: true
      });
    });

    it('should parse sync command', () => {
      const result = parseCommandInput('/sync');
      expect(result).toEqual({
        command: 'sync',
        args: '',
        isComplete: true
      });
    });

    it('should parse help command', () => {
      const result = parseCommandInput('/help');
      expect(result).toEqual({
        command: 'help',
        args: '',
        isComplete: true
      });
    });

    // Test aliases
    it('should parse instance alias "i"', () => {
      const result = parseCommandInput('/i');
      expect(result).toEqual({
        command: 'i',
        args: '',
        isComplete: true
      });
    });

    it('should parse theme alias "t"', () => {
      const result = parseCommandInput('/t');
      expect(result).toEqual({
        command: 't',
        args: '',
        isComplete: true
      });
    });

    it('should parse quit alias', () => {
      const result = parseCommandInput('/quit');
      expect(result).toEqual({
        command: 'quit',
        args: '',
        isComplete: true
      });
    });

    // Test edge cases specific to this app
    it('should handle case insensitive commands', () => {
      const result = parseCommandInput('/PAGES');
      expect(result).toEqual({
        command: 'pages',
        args: '',
        isComplete: true
      });
    });
  });

  describe('getCommandPart - Real command filtering', () => {
    it('should extract "search" from search with query', () => {
      expect(getCommandPart('/search TLS guide')).toBe('search');
    });

    it('should extract "pages" for pages command', () => {
      expect(getCommandPart('/pages')).toBe('pages');
    });

    it('should extract "i" for instance alias', () => {
      expect(getCommandPart('/i')).toBe('i');
    });

    it('should handle partial typing for autocomplete', () => {
      expect(getCommandPart('/sea')).toBe('sea');
      expect(getCommandPart('/del')).toBe('del');
      expect(getCommandPart('/co')).toBe('co');
    });
  });

  describe('Command filtering scenarios', () => {
    it('should work with typical user input patterns', () => {
      // These are the actual patterns users type
      expect(getCommandPart('/s')).toBe('s'); // Should match search, status, sync
      expect(getCommandPart('/se')).toBe('se'); // Should match search
      expect(getCommandPart('/search')).toBe('search'); // Exact match
      expect(getCommandPart('/search news')).toBe('search'); // With args
      expect(getCommandPart('/co')).toBe('co'); // Should match copy, compare
      expect(getCommandPart('/del')).toBe('del'); // Should match delete
    });
  });

  describe('Error cases', () => {
    it('should handle invalid input gracefully', () => {
      expect(parseCommandInput('search')).toBeNull(); // No slash
      expect(parseCommandInput('/')).toEqual({
        command: '',
        args: '',
        isComplete: false
      });
      expect(getCommandPart('invalid')).toBe('');
      expect(isValidCommandInput('invalid')).toBe(false);
    });
  });
});