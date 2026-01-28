/// <reference types="cypress" />

// Custom commands for the GitHub User Search application

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Search for a GitHub user
       */
      searchUser(username: string): Chainable<void>;

      /**
       * Wait for API response and intercept GitHub API calls
       */
      interceptGitHubAPI(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('searchUser', (username: string) => {
  cy.get('input[role="searchbox"]').clear().type(username);
  cy.get('button[aria-label="Buscar"]').click();
});

Cypress.Commands.add('interceptGitHubAPI', () => {
  cy.intercept('GET', 'https://api.github.com/search/users*').as('searchUsers');
  cy.intercept('GET', 'https://api.github.com/users/*').as('userDetails');
  cy.intercept('GET', 'https://api.github.com/users/*/repos*').as('userRepos');
  cy.intercept('GET', 'https://api.github.com/repos/*/*').as('repoDetails');
});

export {};
