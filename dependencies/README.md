# Dependencies

We are currently using Node.js version 8.5 in production.

Style sheets for the browser interface are written in SASS/SCSS. We include the compiled css in the repository. With SASS installed it is possible to compile all style sheets with following command `sass -update public/css` from the application root.

The application is compiled with Webpack \(v4\) and Babel. We target ES2015 with Babel polyfills for compatibility with Internet Explorer 11.

The [xyz entry code](https://github.com/GEOLYTIX/xyz/blob/master/public/js/xyz_entry.js) can be compiled with the `npm run build` command from the root.

