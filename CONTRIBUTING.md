# Contributing

Thank you for helping. Small, focused pull requests are easiest to review.

To report a wrong price or a missing model without fixing it, open an issue with the model's name and a link to the provider's page.

## Adding or correcting a model

1. Find the provider's file, such as `openai.json`. `schemas/models.ts` has the shape of a record, and [AGENTS.md](AGENTS.md) has the rules for modes and capabilities. Before changing a price, read [the pricing contract](docs/pricing.md).
2. Use the provider's official documentation as your source, and link it in the pull request.
3. Add a dated block at the top of `CHANGELOG.md`: what changed, and the source URLs.
4. Run the checks:

   ```sh
   bun scripts/validate-catalogs.ts
   bun tests/validate.test.ts
   bun tests/catalog-policy.test.ts
   bun tests/validate-cli.test.ts
   ```

   The validator also fails when a model's retirement date has passed, so it can report records you did not touch. Say so in the pull request if it does.
5. Sign off every commit with `git commit -s`.

## Sign-off

Every commit needs a `Signed-off-by: Your Name <you@example.com>` line, with your real name. It certifies the [Developer Certificate of Origin](https://developercertificate.org/): you wrote the change, or have the right to submit it under this project's license.

## Using AI tools

You may use AI tools to help, as [Agent Router](https://github.com/theagentrouter/agent-router/blob/main/CONTRIBUTING.md) allows, and this repository has skills for updating the catalogs. You must:

- check every changed value against the provider's documentation;
- answer review questions and revise the change yourself;
- say in the pull request that an AI tool was used;
- make sure the tool adds no license terms beyond the [Apache License 2.0](LICENSE).

## Code of conduct

This project follows the [LF Projects Code of Conduct](CODE_OF_CONDUCT.md), as an Agentic AI Foundation project.
