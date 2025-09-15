// Add custom Cypress commands here if needed

Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from
  // failing the test on uncaught exceptions from the app
  return false
})