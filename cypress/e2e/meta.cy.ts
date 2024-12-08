describe("Check meta tags", () => {
  it("Check meta tags", () => {
    cy.visit("/");

    cy.get("head title").should("have.text", "Lorem Ipsum");
    cy.get("meta[name=description]").should(
      "have.attr",
      "content",
      "Test description",
    );
  });
});
