---
title: SSO (SAML)
layout: root.html
---

# Single Sign On via SAML

The SAML standard allows the XYZ host to provide authorization to user account authenticated by a third party identity provider.

Single sign on (SSO) requests must be initiated by the service provider. The [SAML module](https://github.com/GEOLYTIX/xyz/blob/development/mod/user/saml.js) provides endpoints to initiate sign on, assertaion, metadata, and log out.

The [SAML2-JS package](https://www.npmjs.com/package/saml2-js) is required by the module to configure a service provider (SP) and identity provider (IDP) for the SAML authentication flow.

Following environment keys are used to configure the SAML module.

```
"SAML_ENTITY_ID": "geolytix-xyz-sp",
"SAML_LOGIN": "true",
"SAML_SP_CRT": "geolytix_xyz_saml",
"SAML_IDP_CRT": "pingone_sso_certificate",
"SAML_ACS": "https://geolytix.dev/mapp/saml/acs",
"SAML_SSO": "https://auth.pingone.eu/dd912efb-f9b0-4fa5-9c9c-68c317910396/saml20/idp/sso",
"SAML_SLO": "https://auth.pingone.eu/dd912efb-f9b0-4fa5-9c9c-68c317910396/saml20/idp/slo",
```

The SAML_ENTITY_ID must be a unique entity ID for the service provider. The value must be provided to the IDP admin.

If set SAML_LOGIN is enabled for the Mapp client. If not set the ACS endpoint will return the decoded user from the SAML token.

The SAML_SSO and SAML_SLO URLs must be provided by the IDP administrator in order to configure the SAML2 module in XYZ host.

The SAML_IDP_CRT references a *.crt file in the XYZ host root. The x.509 certificate must be provided by the IDP admin.

The SAML_SP_CRT references a *.crt and matching *.pem file in the XYZ host root. A selfsigned x.509 certificate and private key can be generated with [openssl](https://www.openssl.org/).

```
openssl req -x509 -newkey rsa:4096 -keyout geolytix_xyz_saml.pem -out geolytix_xyz_saml.crt -nodes -days 3650 -subj /CN=geolytix_xyz_saml
```