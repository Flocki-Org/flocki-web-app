describe('Sign in', () => {
  it('shows the email and password form', () => {
    cy.visit('/login')
    cy.contains('h1', 'Sign In')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.contains('button', 'SIGN IN')
  })
})
