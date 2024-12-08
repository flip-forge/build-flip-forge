// https://on.cypress.io/api

describe("Test flip forge book", () => {
  it("Check generated flip forge site", () => {
    cy.visit("/");

    cy.get(".toolbar").contains("0 / 8");
    cy.get('[data-page="1"]').should("be.visible");

    cy.get(".toolbar [title='Go forward']").click();
    cy.get(".toolbar").contains("2 / 8");
    cy.get('[data-page="2"]').should("be.visible");
    cy.get('[data-page="3"]').should("be.visible");

    cy.get("body").type("{rightArrow}");
    cy.get(".toolbar").contains("4 / 8");
    cy.get('[data-page="4"]').should("be.visible");
    cy.get('[data-page="5"]').should("be.visible");

    cy.get("body").trigger("wheel", { deltaY: -120 });
    cy.get(".toolbar").contains("2 / 8");
    cy.get('[data-page="2"]').should("be.visible");
    cy.get('[data-page="3"]').should("be.visible");

    cy.get(".toolbar [title='Go forward']").click();
    cy.get(".toolbar").contains("4 / 8");
    cy.get('[data-page="4"]').should("be.visible");
    cy.get('[data-page="5"]').should("be.visible");

    cy.get("body").type("{end}");
    cy.get(".toolbar").contains("8 / 8");
    cy.get('[data-page="8"]').should("be.visible");

    cy.get(".toolbar [title='Go to start']").click();
    cy.get(".toolbar").contains("0 / 8");
    cy.get('[data-page="1"]').should("be.visible");
  });
});
