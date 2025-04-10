/**
 * @module lib/ui/locations/entries/cloudinary
 */

/**
 * Entry point for the cloudinary test module
 * @function cloudinaryTest
 */
export function cloudinary() {
  codi.describe(
    {
      name: 'Cloudinary test:',
      id: 'ui_locations_entries_cloudinary',
      parentId: 'ui_locations_entries',
    },
    () => {
      /**
       * @description Should return image preview
       * @function it
       */
      codi.it(
        {
          name: 'Should return cloudinary res url for image preview with trash icon',
          parentId: 'ui_locations_entries_cloudinary',
        },
        () => {
          const entry = {
            title: 'Image',
            type: 'image',
            cloudinary_folder: 'test',
            value:
              'https://res.cloudinary.com/dvx8vwneg/image/upload/v1730365463/test/%401730365462823.jpg',
            edit: true,
          };

          const imageEntry = mapp.ui.locations.entries.image(entry);

          codi.assertEqual(
            imageEntry.children[0].getAttribute('src'),
            entry.value,
            'Image src should be the entrys value',
          );

          codi.assertTrue(
            imageEntry.children[1].classList.contains('delete'),
            'Image should have a delete button',
          );
          codi.assertEqual(
            imageEntry.children[1].getAttribute('data-src'),
            entry.value,
            'Delete button src should match entry value',
          );
        },
      );

      /**
       * @description Should return document name
       * @function it
       */
      codi.it(
        {
          name: 'Should return cloudinary res url for document preview with trash icon',
          parentId: 'ui_locations_entries_cloudinary',
        },
        () => {
          const entry = {
            title: 'Documents',
            type: 'documents',
            cloudinary_folder: 'test',
            edit: true,
            value: [
              'https://res.cloudinary.com/dvx8vwneg/raw/upload/v1730363322/test/test-10-31T10:28.txt',
            ],
          };

          const documentEntry = mapp.ui.locations.entries.documents(entry);

          const linkHolder = documentEntry.querySelector('.link-with-img');

          codi.assertEqual(
            linkHolder.querySelector('a').getAttribute('href'),
            entry.value[0],
            'Document href should match entry value',
          );

          codi.assertTrue(
            linkHolder.querySelector('.delete').getAttribute('Title') ===
              'Delete',
            'Document should have a delete button',
          );
          codi.assertEqual(
            linkHolder.querySelector('.delete').getAttribute('data-href'),
            entry.value[0],
            'Delete button src should match entry value',
          );
        },
      );

      /**
       * @description Should return multiple images in an image grid
       * @function it
       */
      codi.it(
        {
          name: 'Should return an image grid with trash icons on each',
          parentId: 'ui_locations_entries_cloudinary',
        },
        () => {
          const entry = {
            title: 'Images',
            type: 'images',
            cloudinary_folder: 'test',
            edit: true,
            value: [
              'https://res.cloudinary.com/dvx8vwneg/image/upload/v1730365463/test/%401730365462823.jpg',
              'https://res.cloudinary.com/dvx8vwneg/image/upload/v1730365463/test/%401730365462823.jpg',
            ],
          };

          const imagesEntry = mapp.ui.locations.entries.images(entry);

          codi.assertEqual(
            imagesEntry.children.length,
            3,
            'Multiple images should appear in the infoj',
          );
        },
      );

      /**
       * @description Should return multiple images in an image grid
       * @function it
       */
      codi.it(
        {
          name: 'Should return an image with no trash icon',
          parentId: 'ui_locations_entries_cloudinary',
        },
        () => {
          const entry = {
            title: 'Image',
            type: 'image',
            cloudinary_folder: 'test',
            value:
              'https://res.cloudinary.com/dvx8vwneg/image/upload/v1730365463/test/%401730365462823.jpg',
          };

          const imageEntry = mapp.ui.locations.entries.image(entry);

          codi.assertEqual(
            imageEntry.children.length,
            1,
            'Image should not have a delete button',
          );
        },
      );
    },
  );
}
