import { describe, expect, it } from 'vitest';

// This test requires a browser environment with the mapp library loaded.
// It is skipped in server-side vitest runs.
describe.skip('Link Button Test', () => {
  const links = [
    {
      href: '/url/url',
      title: 'TITLE HERE',
      target: '_blank',
      css_class: 'mask-icon',
      css_style:
        'mask-image: url(https://geolytix.github.io/MapIcons/services/component_exchange.svg); -webkit-mask-image: url(https://geolytix.github.io/MapIcons/services/component_exchange.svg);',
    },
    {
      title: 'WILL NOT BE ADDED AS NO HREF',
      target: '_blank',
      css_class: 'mask-icon',
      css_style:
        'mask-image: url(https://geolytix.github.io/MapIcons/services/component_exchange.svg); -webkit-mask-image: url(https://geolytix.github.io/MapIcons/services/component_exchange.svg);',
    },
    {
      title: 'WILL BE ADDED AS HREF',
      href: '/url/url2',
      target: '_blank',
      css_class: 'mask-icon',
      css_style:
        'mask-image: url(https://geolytix.github.io/MapIcons/services/component_exchange.svg); -webkit-mask-image: url(https://geolytix.github.io/MapIcons/services/component_exchange.svg);',
    },
    {
      title: 'Locale HREF',
      href: '/url/url3',
      target: '_blank',
      css_class: 'mask-icon',
      css_style:
        'mask-image: url(https://geolytix.github.io/MapIcons/services/component_exchange.svg); -webkit-mask-image: url(https://geolytix.github.io/MapIcons/services/component_exchange.svg);',
      locale: true,
    },
  ];

  it('Should add a link button to the mapButton panel', () => {
    const mapview = {};
    mapp.plugins.link_button(links, mapview);

    const mapButton = mapview.mapButton;
    const linkButton = mapButton.querySelector('a[title="TITLE HERE"]');

    expect(linkButton.getAttribute('href')).toEqual('/url/url');
  });

  it('Should not add a button if no href is provided', () => {
    const mapview = {};
    mapp.plugins.link_button(links, mapview);

    const mapButton = mapview.mapButton;
    const linkButton = mapButton.querySelector(
      'a[title="SHOULD NOT BE ADDED AS NO HREF"]',
    );

    expect(!linkButton).toBeTruthy();
  });

  it('Should add multiple buttons if the link_button config is an array', () => {
    const mapview = {};
    mapp.plugins.link_button(links, mapview);

    const mapButton = mapview.mapButton;
    const linkButton = mapButton.querySelector('a[title="TITLE HERE"]');
    const linkButton2 = mapButton.querySelector(
      'a[title="WILL BE ADDED AS HREF"]',
    );

    expect(linkButton.getAttribute('href')).toEqual('/url/url');
    expect(linkButton2.getAttribute('href')).toEqual('/url/url2');
  });

  it('Should add a link with the locale added to the href', () => {
    const mapview = {};
    mapp.plugins.link_button(links, mapview);

    const mapButton = mapview.mapButton;
    const linkButton = mapButton.querySelector('a[title="Locale HREF"]');

    expect(linkButton.getAttribute('href').includes('locale=')).toBeTruthy();
  });
});
