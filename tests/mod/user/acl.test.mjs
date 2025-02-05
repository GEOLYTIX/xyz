globalThis.xyzEnv = {
  PRIVATE: 'I am a thing:another:thing',
};

codi.describe({ name: 'acl test', id: 'acl_test' }, () => {
  codi.it({ name: 'acl', parentId: 'acl_test' }, async () => {
    // const { acl } = await import('../../../mod/user/acl.js');
    // console.log(acl);
  });
});
