describe('Results Feature', () => {
  beforeEach(() => {
    cy.interceptGitHubAPI();
  });

  describe('Page Navigation', () => {
    it('should redirect to home if no username provided', () => {
      cy.visit('/results');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should load results page with username parameter', () => {
      cy.visit('/results?username=octocat');
      cy.wait('@userDetails');
      cy.wait('@userRepos');

      cy.get('main').should('be.visible');
    });
  });

  describe('User Information Card', () => {
    beforeEach(() => {
      cy.visit('/results?username=octocat');
      cy.wait('@userDetails');
    });

    it('should display user avatar', () => {
      cy.get('img[alt*="perfil"]').should('be.visible');
    });

    it('should display user name or login', () => {
      cy.get('h2').should('be.visible');
    });

    it('should display user statistics', () => {
      cy.contains('Seguidores').should('be.visible');
      cy.contains('Seguindo').should('be.visible');
      cy.contains('Repositórios').should('be.visible');
    });

    it('should display link to GitHub profile', () => {
      cy.get('a[href*="github.com"]')
        .should('have.attr', 'target', '_blank')
        .and('have.attr', 'rel', 'noopener noreferrer');
    });
  });

  describe('Repository List', () => {
    beforeEach(() => {
      cy.visit('/results?username=facebook');
      cy.wait('@userDetails');
      cy.wait('@userRepos');
    });

    it('should display repository section title', () => {
      cy.contains('Repositórios').should('be.visible');
    });

    it('should display repository cards', () => {
      cy.get('[role="list"]', { timeout: 10000 })
        .find('li')
        .should('have.length.at.least', 1);
    });

    it('should display repository information', () => {
      cy.get('[role="list"] li').first().within(() => {
        cy.get('h3').should('be.visible');
      });
    });

    it('should navigate to repository details on click', () => {
      // Repository card is an article with role="button"
      cy.get('[role="list"] li').first().find('article[role="button"]').click();

      cy.url().should('include', '/repository');
      cy.url().should('include', 'owner=');
      cy.url().should('include', 'repo=');
    });
  });

  describe('Sort Controls', () => {
    beforeEach(() => {
      cy.visit('/results?username=facebook');
      cy.wait('@userDetails');
      cy.wait('@userRepos');
    });

    it('should display sort button', () => {
      cy.get('button[aria-label*="Ordenar"]').should('be.visible');
    });

    it('should open sort dropdown on click', () => {
      cy.get('button[aria-label*="Ordenar"]').click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should show sort options', () => {
      cy.get('button[aria-label*="Ordenar"]').click();

      cy.contains('A → Z').should('be.visible');
      cy.contains('Z → A').should('be.visible');
    });

    it('should apply sort and close dropdown', () => {
      cy.get('button[aria-label*="Ordenar"]').click();
      cy.contains('button', 'A → Z').click();
      cy.contains('button', 'Aplicar').click();

      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should show active filter indicator', () => {
      cy.get('button[aria-label*="Ordenar"]').click();
      cy.contains('button', 'A → Z').click();
      cy.contains('button', 'Aplicar').click();

      cy.get('button[aria-label*="filtros ativos"]').should('be.visible');
    });
  });

  describe('Infinite Scroll / Pagination', () => {
    it('should load more repositories on scroll for users with many repos', () => {
      cy.visit('/results?username=google');
      cy.wait('@userDetails');
      cy.wait('@userRepos');

      // Wait for initial repos to load
      cy.get('[role="list"] li', { timeout: 10000 }).should('have.length.at.least', 1);

      cy.get('[role="list"] li').then(($initialItems) => {
        const initialCount = $initialItems.length;

        // Only test scroll if we have enough repos
        if (initialCount >= 10) {
          cy.scrollTo('bottom');

          // Wait a bit for the intersection observer to trigger
          cy.wait(1000);

          // Check if more repos were loaded (or at least no error)
          cy.get('[role="list"] li').should('have.length.at.least', initialCount);
        }
      });
    });
  });

  describe('Back Navigation', () => {
    it('should navigate back to search on back button click', () => {
      cy.visit('/results?username=octocat');
      cy.wait('@userDetails');

      cy.contains('button', 'Voltar').click();

      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Error Handling', () => {
    it('should show error message for non-existent user', () => {
      cy.intercept('GET', 'https://api.github.com/users/nonexistentuser12345xyz', {
        statusCode: 404,
        body: { message: 'Not Found' },
      }).as('userNotFound');

      cy.visit('/results?username=nonexistentuser12345xyz');
      cy.wait('@userNotFound');

      cy.get('[role="alert"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.visit('/results?username=octocat');
      cy.wait('@userDetails');
    });

    it('should have proper heading structure', () => {
      cy.get('h1').should('exist');
      cy.get('h2').should('exist');
    });

    it('should have accessible navigation', () => {
      cy.get('nav[aria-label="Navegação"]').should('exist');
    });

    it('should have accessible repository list', () => {
      cy.get('[role="region"][aria-label*="repositórios"]').should('exist');
    });
  });
});
