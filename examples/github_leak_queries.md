# GitHub Leak Search Examples

Useful GitHub search queries to identify potential credential or data leaks.

## Example Search Queries

```
filename:.env DB\_PASSWORD
filename:.git-credentials
extension\:json api\_key
extension\:yaml password
org\:yourcompany password
```
These can be run directly in GitHub search or automated using the GitHub Search API.

## Automation Tip

Use tools like [GitHub Dorks](https://github.com/techgaun/github-dorks) or GitHub's own GraphQL and REST APIs to continuously monitor for exposed secrets tied to your organization or technology stack.