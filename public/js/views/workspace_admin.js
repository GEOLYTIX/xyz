const xhr = new XMLHttpRequest();

xhr.open('GET', document.head.dataset.dir + '/workspace/get?token=' + document.body.dataset.token);

xhr.onload = e => init(JSON.parse(e.target.response));

xhr.send();

function init(json) {

  let mode = document.body.dataset.mode;

  let editor = new JSONEditor(document.getElementById('jsoneditor'), { mode: mode });
   
  editor.set(json);
    
  json = editor.get();
    
  let editormenu = document.querySelector('.jsoneditor-menu');
    
  let search = document.querySelector('.jsoneditor-search');
    
  //add save button
  let btnSave = document.createElement('button');
  btnSave.style.background = 'none';
  btnSave.innerHTML = '<i class="material-icons" title="Upload settings to data store.">cloud_upload</i>';
  editormenu.insertBefore(btnSave, search);
    
  btnSave.addEventListener('click', function () {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', document.head.dataset.dir + '/workspace/load?token=' + document.body.dataset.token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function () {
      if (this.status !== 200) alert('I am not here. This is not happening.');

      // Set cleaned json to editor;
      editor.set(JSON.parse(this.response));

      document.getElementById('workspace_mask').style.display = 'none';
    };

    document.getElementById('workspace_mask').style.display = 'block';
    
    let settings = {};

    try {
      settings = editor.get();
    } catch(err) {
      console.error(err);
    }
    
    xhr.send(JSON.stringify({
      settings: settings
    }));
  });
    
  if (mode === 'tree') {

    let btnFile = document.createElement('button');
    btnFile.style.background = 'none';
    btnFile.innerHTML = '<i class="material-icons" title="Upload settings file.">description</i>';
    editormenu.insertBefore(btnFile, search);
  
    let fileSelector = document.createElement('input');
    fileSelector.style.display = 'none';
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('accept', '.json');
    btnFile.appendChild(fileSelector);
        
    fileSelector.addEventListener('change', function () {
      let reader = new FileReader();
      reader.onload = function () {
        try {
          fileSelector.value = null;
          editor.set(JSON.parse(this.result));
        } catch (err) {
          alert('Failed to parse JSON');
        }
      };
      reader.readAsText(this.files[0]);
    });
        
    btnFile.addEventListener('click', function () {
      fileSelector.click();
      //return false;
    });
        
    editormenu.insertBefore(btnFile, search);
  }
    
  if (mode === 'tree') {

    let btnCode = document.createElement('button');
    btnCode.style.background = 'none';
    btnCode.innerHTML = '<i class="material-icons" title="JSON code view.">code</i>';
    editormenu.insertBefore(btnCode, search);
    
    btnCode.addEventListener('click', function () {
      window.location.replace(document.head.dataset.dir + '/workspace/admin/json');
    });
  }
    
  if (mode === 'code') {
    let btnTree = document.createElement('button');
    btnTree.style.background = 'none';
    btnTree.innerHTML = '<i class="material-icons" title="Tree view">list</i>';
    editormenu.insertBefore(btnTree, search);
    
    btnTree.addEventListener('click', function () {
      window.location.replace(document.head.dataset.dir + '/workspace/admin');
    });
  }

}