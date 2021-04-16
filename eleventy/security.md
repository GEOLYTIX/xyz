---
title: Security
layout: root.html
---

# Security

The XYZ/Mapp system architecture consists of 3 layers: Data Source => Domain / Service => Presentation

In a layered system without servers to secure, security must be applied to requests which are passed between layers.

The Presentation Layer must not act directly upon the Data Source Layer.

All requests from the Presentation Layer to the Domain / Service layer must be secured by cryptographic protocols. The Domain / Service Requests can authenticate requests by validating the signature of a JSON Web Token (JWT) which may be provided as a request cookie.

By [our own] definition the serverless Domain/Service Layer will act as an agent to provide secure access to the Data Source Layer on behalf of the Presentation Layer.

Transactional scripts must not originate in the Presentation Layer. The parameter substitution in script templates within the Domain / Service Layer is considered safe.

Script components and their dependencies as defined in the package manifest are considered safe.