describe('Repository Details Feature', () => {
  beforeEach(() => {
    cy.interceptGitHubAPI();
  });

  describe('Page Navigation', () => {
    it('should redirect to home if owner is missing', () => {
      cy.visit('/repository?repo=react');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should redirect to home if repo is missing', () => {
      cy.visit('/repository?owner=facebook');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should load repository details with valid parameters', () => {
      cy.visit('/repository?owner=facebook&repo=react');
      cy.wait('@repoDetails');

      cy.get('main').should('be.visible');
    });
  });

  describe('Repository Header', () => {
    beforeEach(() => {
      cy.visit('/repository?owner=facebook&repo=react');
      cy.wait('@repoDetails');
    });

    it('should display repository name', () => {
      cy.get('h1').should('be.visible').and('contain.text', 'react');
    });

    it('should display repository description', () => {
      cy.get('article').should('be.visible');
    });

    it('should display GitHub link', () => {
      cy.get('a[href*="github.com/facebook/react"]')
        .should('be.visible')
        .and('have.attr', 'target', '_blank');
    });
  });

  describe('Repository Statistics', () => {
    beforeEach(() => {
      cy.visit('/repository?owner=facebook&repo=react');
      cy.wait('@repoDetails');
    });

    it('should display stars count', () => {
      cy.contains('estrelas').should('be.visible');
    });

    it('should display forks count', () => {
      cy.contains('forks').should('be.visible');
    });

    it('should display watchers count', () => {
      cy.contains('observadores').should('be.visible');
    });
  });

  describe('Repository Information', () => {
    beforeEach(() => {
      cy.visit('/repository?owner=facebook&repo=react');
      cy.wait('@repoDetails');
    });

    it('should display information section', () => {
      cy.contains('Informações').should('be.visible');
    });

    it('should display language if available', () => {
      cy.contains('Linguagem').should('be.visible');
    });

    it('should display creation date', () => {
      cy.contains('Criado em').should('be.visible');
    });

    it('should display last update date', () => {
      cy.contains('Última atualização').should('be.visible');
    });

    it('should display default branch', () => {
      cy.contains('Branch padrão').should('be.visible');
    });
  });

  describe('Repository Topics', () => {
    it('should display topics if available', () => {
      cy.visit('/repository?owner=facebook&repo=react');
      cy.wait('@repoDetails');

      cy.get('body').then(($body) => {
        if ($body.text().includes('Tópicos')) {
          cy.contains('Tópicos').should('be.visible');
          cy.get('ul[aria-labelledby="topics-label"] li').should('have.length.at.least', 1);
        }
      });
    });
  });

  describe('Back Navigation', () => {
    it('should navigate back on back button click', () => {
      // First visit results page
      cy.visit('/results?username=facebook');
      cy.wait('@userDetails');
      cy.wait('@userRepos');

      // Then navigate to repository details - Repository card is an article with role="button"
      cy.get('[role="list"] li').first().find('article[role="button"]').click();
      cy.wait('@repoDetails');

      // Click back button
      cy.contains('button', 'Voltar').click();

      // Should be back on results page
      cy.url().should('include', '/results');
    });
  });

  describe('Error Handling', () => {
    it('should show error message for non-existent repository', () => {
      cy.intercept('GET', 'https://api.github.com/repos/facebook/nonexistentrepo12345', {
        statusCode: 404,
        body: { message: 'Not Found' },
      }).as('repoNotFound');

      cy.visit('/repository?owner=facebook&repo=nonexistentrepo12345');
      cy.wait('@repoNotFound');

      cy.get('[role="alert"]').should('be.visible');
    });

    it('should show error message on API failure', () => {
      cy.intercept('GET', 'https://api.github.com/repos/*/*', {
        statusCode: 403,
        body: { message: 'API rate limit exceeded' },
      }).as('rateLimitError');

      cy.visit('/repository?owner=test&repo=test');
      cy.wait('@rateLimitError');

      cy.get('[role="alert"]').should('be.visible');
    });
  });

  describe('External Links', () => {
    beforeEach(() => {
      cy.visit('/repository?owner=facebook&repo=react');
      cy.wait('@repoDetails');
    });

    it('should have View on GitHub link with correct attributes', () => {
      cy.contains('Ver no GitHub')
        .should('have.attr', 'href')
        .and('include', 'github.com');

      cy.contains('Ver no GitHub')
        .should('have.attr', 'target', '_blank')
        .and('have.attr', 'rel', 'noopener noreferrer');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.visit('/repository?owner=facebook&repo=react');
      cy.wait('@repoDetails');
    });

    it('should have proper heading structure', () => {
      cy.get('h1').should('exist');
      cy.get('h2').should('exist');
    });

    it('should have accessible navigation', () => {
      cy.get('nav[aria-label="Navegação"]').should('exist');
    });

    it('should have accessible back button', () => {
      cy.get('button').contains('Voltar').should('be.visible');
    });

    it('should have proper article structure', () => {
      cy.get('article').should('exist');
    });
  });

  describe('Loading State', () => {
    it('should show loading state while fetching data', () => {
      cy.intercept('GET', 'https://api.github.com/repos/*/*', (req) => {
        req.on('response', (res) => {
          res.setDelay(1000);
        });
      }).as('slowRepoDetails');

      cy.visit('/repository?owner=facebook&repo=react');

      cy.contains('Carregando').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/repository?owner=facebook&repo=react');
      cy.wait('@repoDetails');

      cy.get('h1').should('be.visible');
      cy.contains('Informações').should('be.visible');
    });

    it('should display correctly on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/repository?owner=facebook&repo=react');
      cy.wait('@repoDetails');

      cy.get('h1').should('be.visible');
      cy.contains('Informações').should('be.visible');
    });
  });
});
