/**
 * @module lib/ui/locations/entries/cloudinary
 */

/**
 * Entry point for the cloudinary test module
 * @function cloudinaryTest 
 */
export async function cloudinaryTest() {
    await codi.describe('UI Entries: Cloudinary', async () => {

        /**
         * @description Should return image preview
         * @function it
         */
        await codi.it('Should return cloudinary res url for image preview with trash icon', async () => {

            const entry = {
                title: 'Image', 
                type: 'image', 
                cloudinary_folder: 'test', 
                value: 'https://res.cloudinary.com/dvx8vwneg/image/upload/v1730365463/test/%401730365462823.jpg', 
                edit: true
    
            }

            const imageEntry = mapp.ui.locations.entries.image(entry)
            
            codi.assertEqual(imageEntry.children[0].getAttribute('src'), entry.value, 'Image src should be the entrys value');
            codi.assertTrue(imageEntry.children[1].classList.contains('trash'), 'Image should have a delete button');
            codi.assertEqual(imageEntry.children[1].getAttribute('data-src'), entry.value, 'Delete button src should match entry value');

        });

        /**
         * @description Should return document name
         * @function it
         */
        await codi.it('Should return cloudinary res url for document preview with trash icon', async () => {

            const entry = { 
                            title: 'Documents', 
                            type: 'documents', 
                            cloudinary_folder: 'test', 
                            edit: true,
                            value: [ 'https://res.cloudinary.com/dvx8vwneg/raw/upload/v1730363322/test/test-10-31T10:28.txt' ] 
                         }
            

            const documentEntry = mapp.ui.locations.entries.documents(entry)
            
            const linkHolder = documentEntry.children[1]
            codi.assertEqual(linkHolder.children[1].getAttribute('href'), entry.value[0], 'Document href should be the entrys value');
            codi.assertTrue(linkHolder.children[0].classList.contains('trash'), 'Document should have a delete button');
            codi.assertEqual(linkHolder.children[0].getAttribute('data-href'), entry.value[0], 'Delete button src should match entry value');

        });

         /**
         * @description Should return multiple images in an image grid
         * @function it
         */
        await codi.it('Should return an image grid with trash icons on each', async () => {

            const entry = { 
                            title: 'Images', 
                            type: 'images', 
                            cloudinary_folder: 'test', 
                            edit: true,
                            value: [ 
                                     'https://res.cloudinary.com/dvx8vwneg/image/upload/v1730365463/test/%401730365462823.jpg',
                                     'https://res.cloudinary.com/dvx8vwneg/image/upload/v1730365463/test/%401730365462823.jpg'
                                   ] 
                            }
            

            const imagesEntry = mapp.ui.locations.entries.images(entry)
        
            codi.assertEqual(imagesEntry.children.length, 3, 'Multiple images should appear in the infoj');
        });

        /**
         * @description Should return multiple images in an image grid
         * @function it
         */
        await codi.it('Should return an image with no trash icon', async () => {

            const entry = {
                title: 'Image', 
                type: 'image', 
                cloudinary_folder: 'test', 
                value: 'https://res.cloudinary.com/dvx8vwneg/image/upload/v1730365463/test/%401730365462823.jpg'
            }

            const imageEntry = mapp.ui.locations.entries.image(entry)
            
            codi.assertEqual(imageEntry.children.length, 1, 'Image should not have a delete button');
        });
    })
}