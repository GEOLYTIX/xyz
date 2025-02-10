// import 'dotenv/config';
// import '../../../mod/utils/processEnv.js';
//
// const mock = codi.mock;
//
// await codi.describe(
//   { name: 'provider test', id: 'provider_test' },
//   async () => {
//     await codi.it(
//       { name: 'Bogus provider test', parentId: 'provider_test' },
//       async () => {
//         const { default: provider } = await import(
//           '../../../mod/provider/_provider.js'
//         );
//
//         const req = {
//           params: {
//             provider: 'mongo',
//           },
//         };
//
//         const res = {
//           status: (code) => ({ send: (message) => ({ code, message }) }),
//           send: (message) => ({ message }),
//         };
//
//         const result = await provider(req, res);
//
//         codi.assertEqual(result.code, 404);
//         codi.assertEqual(
//           result.message,
//           "Failed to validate 'provider=mongo' param.",
//         );
//       },
//     );
//
//     await codi.it(
//       { name: 'Test Providers', parentId: 'provider_test' },
//       async () => {
//         const providers = ['file', 'cloudfront', 's3'];
//
//         const expectedValues = {
//           file: {
//             data: 'Look at me go from the file provider fam!',
//             content_type: 'application/text',
//             headers: {
//               'content-type': 'application/text',
//             },
//           },
//           cloudfront: {
//             data: '{"test":{"another_test":{}}}',
//             content_type: 'application/json',
//             headers: {
//               'content-type': 'application/json',
//             },
//           },
//           s3: {
//             data: 'http://localhost:3000/',
//             content_type: 'application/text',
//             headers: {
//               'content-type': 'application/text',
//             },
//           },
//         };
//
//         function file(ref) {
//           ref = '';
//           return String('Look at me go from the file provider fam!');
//         }
//
//         function cloudfront(ref) {
//           ref = '';
//           return '{"test":{"another_test":{}}}';
//         }
//
//         function s3_provider(ref) {
//           ref = '';
//           return 'http://localhost:3000/';
//         }
//
//         mock.module('../../../mod/provider/file.js', () => {
//           return {
//             default: file,
//           };
//         });
//
//         mock.module('../../../mod/provider/cloudfront.js', () => {
//           return {
//             default: cloudfront,
//           };
//         });
//
//         mock.module('../../../mod/provider/s3.js', () => {
//           return {
//             default: s3_provider,
//           };
//         });
//
//         const { default: provider } = await import(
//           '../../../mod/provider/_provider.js'
//         );
//
//         providers.forEach(async (providerName) => {
//           const { req, res } = codi.mockHttp.createMocks({
//             params: {
//               provider: providerName,
//               content_type: expectedValues[providerName].content_type,
//             },
//           });
//
//           await provider(req, res);
//
//           const data = res._getData();
//           const headers = res.getHeaders();
//
//           codi.assertEqual(data, expectedValues[providerName].data);
//           codi.assertEqual(headers, expectedValues[providerName].headers);
//         });
//       },
//     );
//   },
// );
