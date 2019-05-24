export default _xyz => param => {

    param.documentControl.add_doc = _xyz.utils.createElement({
        tag: 'div',
        options: {
            classList: 'addDocCell'
        },
        style: {
            display: 'block'
        },
        appendTo: param.documentControl.container
    });

    // Add label for doc upload icon.
    param.documentControl.add_doc_label = _xyz.utils.createElement({
        tag: 'label',
        options: {
            htmlFor: `addDoc_${param.entry.location.layer}_${param.entry.location.id}`
        },
        appendTo: param.documentControl.add_doc
    });

    // Add doc upload icon to label.
    _xyz.utils.createElement({
        tag: 'i',
        options: {
            className: 'material-icons cursor noselect',
            textContent: 'add_circle_outline'
        },
        style: {
            cursor: 'pointer'
        },
        appendTo: param.documentControl.add_doc_label
    });

    // Add doc input.
    param.documentControl.add_doc_input = _xyz.utils.createElement({
        tag: 'input',
        options: {
            id: `addDoc_${param.entry.location.layer}_${param.entry.location.id}`,
            type: 'file',
            //multiple: true,
            accept: '.txt,.pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document;' // check this
        },
        style: {
            display: 'none'
        },
        appendTo: param.documentControl.add_doc
    });

    // empty the file input value
    param.documentControl.add_doc_input.addEventListener('click', () => {
        param.documentControl.add_doc_input.value = '';
    });

    // add change event 
    param.documentControl.add_doc_input.addEventListener('change', e => {

        let newDoc = _xyz.utils.createElement({ tag: 'div' });

        const reader = new FileReader();

        let file_type;

        reader.onload = blob => {
            param.documentControl.blob = blob.target.result;
        };

        let file = e.target.files[0];

        let public_id = file.name;

        reader.readAsDataURL(file);

        let file_name = _xyz.utils.createElement({
            tag: 'a',
            options: {
                textContent: file.name.split('/').pop(),
                target: '_blank'
            },
            appendTo: newDoc
        });

        let btn_del = _xyz.utils.createElement({
            tag: 'span',
            options: {
                title: 'Delete document',
                className: 'btn_del',
                innerHTML: '<i class="material-icons">clear</i>'
            },
            style: {
                cursor: 'pointer'
            },
            appendTo: newDoc,
            eventListener: {
                event: 'click',
                funct: () => {
                    newDoc.remove();
                }
            }
        });

        // Add control to upload document
        const btn_save = _xyz.utils.createElement({
            tag: 'span',
            options: {
                title: 'Save document',
                className: 'btn_save',
                innerHTML: '<i class="material-icons">cloud_upload</i>'
            },
            style: {
                cursor: 'pointer'
            },
            appendTo: newDoc,
            eventListener: {
                event: 'click',
                funct: () => {

                    btn_del.remove();
                    btn_save.remove();

                    param.entry.ctrl.upload_document({
                        entry: param.entry,
                        doc: newDoc,
                        public_id: public_id,
                        blob: param.documentControl.blob
                    });
                }
            }
        });

        // insert new doc before last doc
        param.documentControl.container.appendChild(newDoc);

    });

}