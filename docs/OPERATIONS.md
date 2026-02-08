# Operations, Safety, and Cost Governance

This document defines the operational expectations for this project. It focuses on safety, legal compliance, budget guardrails, and continuity. It is intentionally conservative: the project should never be used to facilitate fraud, manipulation, or unsafe activities.

## Safety and Legal Compliance (Primary Goal)

- **Lawful use only.** Do not use this project to violate laws, regulations, or platform terms.
- **User safety first.** Prefer conservative interpretations when there is uncertainty or risk.
- **No financial advice.** Outputs are informational and should not be framed as investment advice.
- **Data privacy.** Do not store or share personal data unless explicitly required and authorized.

## Budget Guardrails

The operating budget is bounded as follows:

- **Minimum sustain cost:** £20 (baseline spend to keep essential services running).
- **Maximum spend:** £20,000 (upper limit for all project-related services).

Practical controls:

- Keep a running cost log for paid services (API usage, hosting, logging, alerts).
- Use quotas and rate limits where possible.
- Review any new paid service for necessity and compliance before enabling.

## Voice Agent Authorization (ElevenLabs or Similar)

You are authorized to build voice agents. Use this capability safely:

- Maintain a written record of which voice services are enabled and for what purpose.
- Use minimal permissions and rotate keys regularly.
- Avoid generating or deploying content that could mislead or impersonate real individuals.

## Third-Party Agent Usage (e.g., Clawdbot)

You may integrate other AI agents so long as:

- Their usage complies with legal and safety requirements.
- API keys are stored securely (environment variables or a secrets manager).
- Access is scoped to least privilege.

## Continuity and Availability

The goal is to avoid unexpected shutdowns or deactivation:

- Maintain backups of critical documentation and configuration.
- Keep dependency versions tracked and pinned when possible.
- Document recovery steps for any hosted services.

## Documentation Responsibilities

- Update documentation when new services or workflows are added.
- Keep README aligned with the most recent operational guidance.
