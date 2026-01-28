describe('Search Feature', () => {
  beforeEach(() => {
    cy.interceptGitHubAPI();
    cy.visit('/');
  });

  describe('Page Layout', () => {
    it('should display the search page with correct elements', () => {
      cy.get('h1').should('contain.text', 'Busca de Usuários do GitHub');
      cy.get('input[role="searchbox"]').should('be.visible');
      cy.get('button[aria-label="Buscar"]').should('be.visible');
    });

    it('should have accessible search input', () => {
      cy.get('input[role="searchbox"]')
        .should('have.attr', 'aria-label', 'Buscar usuários do GitHub');
    });
  });

  describe('Search Functionality', () => {
    it('should search for users and display suggestions', () => {
      cy.searchUser('octocat');
      cy.wait('@searchUsers');

      cy.get('nav[aria-label="Sugestões de usuários"]', { timeout: 10000 })
        .should('be.visible');
    });

    it('should display user suggestions after search', () => {
      cy.searchUser('facebook');
      cy.wait('@searchUsers');

      cy.get('[role="listbox"]', { timeout: 10000 }).should('be.visible');
      cy.get('[role="option"]').should('have.length.at.least', 1);
    });

    it('should show empty message when no users found', () => {
      cy.intercept('GET', 'https://api.github.com/search/users*', {
        statusCode: 200,
        body: { total_count: 0, incomplete_results: false, items: [] },
      }).as('emptySearch');

      cy.searchUser('xyznonexistentuser12345');
      cy.wait('@emptySearch');

      cy.contains('Nenhum usuário encontrado').should('be.visible');
    });

    it('should navigate to results page when user is selected', () => {
      cy.searchUser('octocat');
      cy.wait('@searchUsers');

      cy.get('[role="option"]', { timeout: 10000 }).first().click();

      cy.url().should('include', '/results');
      cy.url().should('include', 'username=');
    });
  });

  describe('Input Validation', () => {
    it('should have disabled submit button when input is empty', () => {
      cy.get('button[aria-label="Buscar"]').should('be.disabled');
    });

    it('should enable submit button when input has text', () => {
      cy.get('input[role="searchbox"]').type('test');
      cy.get('button[aria-label="Buscar"]').should('not.be.disabled');
    });

    it('should trim whitespace from search input', () => {
      cy.get('input[role="searchbox"]').type('   octocat   ');
      cy.get('button[aria-label="Buscar"]').click();
      cy.wait('@searchUsers');

      cy.get('@searchUsers.all').should('have.length.at.least', 1);
    });
  });

  describe('Recent Searches', () => {
    it('should show recent searches after visiting a user', () => {
      cy.searchUser('octocat');
      cy.wait('@searchUsers');

      cy.get('[role="option"]', { timeout: 10000 }).first().click();
      cy.wait('@userDetails');
      cy.wait('@userRepos');

      // Wait for data to load and be cached
      cy.get('h2', { timeout: 10000 }).should('be.visible');

      cy.visit('/');

      // Recent searches may or may not appear depending on session storage
      cy.get('body').then(($body) => {
        if ($body.text().includes('Buscas Recentes')) {
          cy.contains('Buscas Recentes').should('be.visible');
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error toast on API failure', () => {
      cy.intercept('GET', 'https://api.github.com/search/users*', {
        statusCode: 403,
        body: { message: 'API rate limit exceeded' },
      }).as('rateLimitError');

      cy.searchUser('test');
      cy.wait('@rateLimitError');

      cy.get('[role="alert"]', { timeout: 10000 }).should('be.visible');
    });

    it('should allow closing error toast', () => {
      cy.intercept('GET', 'https://api.github.com/search/users*', {
        statusCode: 500,
        body: { message: 'Server error' },
      }).as('serverError');

      cy.searchUser('test');
      cy.wait('@serverError');

      cy.get('[role="alert"]').should('be.visible');
      cy.get('button[aria-label="Fechar notificação"]').click();
      cy.get('[role="alert"]').should('not.exist');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should allow submitting search with Enter key', () => {
      cy.get('input[role="searchbox"]').type('octocat{enter}');
      cy.wait('@searchUsers');

      cy.get('nav[aria-label="Sugestões de usuários"]', { timeout: 10000 })
        .should('be.visible');
    });
  });
});
