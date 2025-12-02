// frontend/cypress/e2e/games/snake.cy.js
describe("Snake Game", () => {
  beforeEach(() => {
    cy.visit("/games/snake");
    cy.get("button").contains("Start Game").click();
  });

  it("starts the game when start button is clicked", () => {
    cy.get(".game-container").should("be.visible");
    cy.get(".score").should("contain", "Score: 0");
  });

  it("increases score when snake eats food", () => {
    // Mock the initial food position
    cy.window().then((win) => {
      win.gameState.food = { x: 2, y: 0 }; // Position food next to snake head
    });

    // Move right to eat the food
    cy.get("body").type("{rightarrow}");

    // Wait for the snake to move
    cy.wait(1000);
    cy.get(".score").should("contain", "Score: 10");
  });

  it("ends the game when snake hits the wall", () => {
    // Move snake to the edge
    for (let i = 0; i < 10; i++) {
      cy.get("body").type("{leftarrow}");
      cy.wait(100);
    }

    // Game over should be shown
    cy.get(".game-over").should("be.visible");
  });
});
