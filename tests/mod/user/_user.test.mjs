await codi.describe({ name: 'user:', id: 'user' }, () => {
  codi.it({ name: 'user place holder', parentId: 'user' }, () => {});
});
