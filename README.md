# build-flip-forge

Build a static page with flip-forge from a PDF. Current only works on ubuntu workflows.

## Example usage

```yaml
- name: build-flip-forge
  id: build
  uses: flip-forge/build-flip-forge@v1
  with:
    # REQUIRED! Path to the PDF file that will be converted to a flipbook
    file: "book.pdf"

    # Meta title used as the HTML page title:
    title: "Flipbook with flip-forge"

    # Background color of the generated web page
    backgroundColor: "#000000"

    # Toolbar color used in the generate web page
    toolbarColor: "#ffffff"

    # Meta description used in the generated web pages
    description: "Flipbook description"
```

## Outputs

- `dist` points to the dist folder with the generated static files.
  Example usage for GitHub pages:
  ```yaml
  - name: build-flip-forge
    id: build
    uses: flip-forge/build-flip-forge@v1
    with:
      file: "book.pdf"
  - name: Upload artifact
    uses: actions/upload-pages-artifact@v3
    with:
      path: ${{ steps.build.outputs.dist }}
  - name: Deploy to GitHub Pages
    id: deployment
    uses: actions/deploy-pages@v4
  ```
