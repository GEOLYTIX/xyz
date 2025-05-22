export function toast() {
  codi.describe(
    { id: 'ui_elements_toast', name: 'Toast:', parentId: 'ui_elements' },
    () => {
      codi.it(
        { name: 'Toast with no actions', parentId: 'ui_elements_toast' },
        () => {
          const toast = mapp.ui.elements.toast({
            content: 'I am content',
          });
        },
      );
    },
  );
}
