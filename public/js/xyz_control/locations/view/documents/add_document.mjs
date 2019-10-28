export default _xyz => param => {

    param.documentControl.add_doc = _xyz.utils.wire()`<div class="addDocCell" style="display: block;">`;

    param.documentControl.container.appendChild(param.documentControl.add_doc);

    // Add label and doc upload icon.
    param.documentControl.add_doc_label = _xyz.utils.wire()`<label class="icons-add-document cursor noselect xyz-icon" title="Add Document"
    style="cursor: pointer; display:block; height:50px;margin:auto;"
    >`;

    param.documentControl.add_doc_label.htmlFor = `addDoc_${param.entry.location.layer.key}_${param.entry.location.id}`;

    param.documentControl.add_doc.appendChild(param.documentControl.add_doc_label);

    // Add doc input.
    param.documentControl.add_doc_input = _xyz.utils.wire()`
    <input type="file"
    accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document;" 
    style="display: none;"
    >`;

    param.documentControl.add_doc_input.id = `addDoc_${param.entry.location.layer.key}_${param.entry.location.id}`;

    param.documentControl.add_doc.appendChild(param.documentControl.add_doc_input);

    // empty the file input value
    param.documentControl.add_doc_input.addEventListener('click', () => {
        param.documentControl.add_doc_input.value = '';
    });

    // add change event 
    param.documentControl.add_doc_input.addEventListener('change', e => {

        let newDoc = _xyz.utils.wire()`<div>`;

        const reader = new FileReader();

        let file_type;

        reader.onload = blob => {
            param.documentControl.blob = blob.target.result;
        };

        let file = e.target.files[0];

        let public_id = file.name;

        reader.readAsDataURL(file);

        let file_name = _xyz.utils.wire()`
        <a target="_blank"
        >${file.name.split('/').pop()}`;

        newDoc.appendChild(file_name);

        let btn_del = _xyz.utils.wire()`
        <span
        title="Delete document"
        class="btn_del icons-clear xyz-documents"
        style="cursor: pointer; display: inline-block; height: 20px; width:20px; vertical-align:middle;"
        onclick=${
            () => {
                newDoc.remove();
            }
        }
        >`; 

        newDoc.appendChild(btn_del);

        // Add control to upload document
        const btn_save = _xyz.utils.wire()`
        <span class="btn_save icons-cloud-upload xyz-documents"
        title="Save document"
        style="cursor: pointer; display: inline-block; height: 20px; width:20px; vertical-align:middle; background-position: center; padding-left:30px;"
        onclick=${
            () => {
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
        >`;

        newDoc.appendChild(btn_save);

        // insert new doc before last doc
        param.documentControl.container.appendChild(newDoc);

    });

}