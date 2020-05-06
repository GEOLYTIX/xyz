window.onload = () => {

const codeMirror = CodeMirror(document.getElementById('codemirror'), {
  value: '{}',
  lineNumbers: true,
  mode: 'application/json',
  gutters: ['CodeMirror-lint-markers'],
  lint: true,
  lineWrapping: true,
  autofocus: true,
});

const fileInput = document.getElementById('fileInputWS');

fileInput.addEventListener('change', function () {

  let reader = new FileReader();
  reader.onload = function () {
    try {
      fileInput.value = null;
      codeMirror.setValue(this.result);
      codeMirror.refresh();

    } catch (err) {
      alert('Failed to parse JSON');
    }
  };
  reader.readAsText(this.files[0]);

});

const btnFile = document.getElementById('btnFileWS');

btnFile.onclick = () => fileInput.click();

const btnUpload = document.getElementById('btnUploadWS');

btnUpload.onclick = () => {

  const xhr = new XMLHttpRequest();
  xhr.open('POST', document.head.dataset.dir + '/api/workspace/set?token=' + document.body.dataset.token);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = e => {
    if (e.target.status !== 200) alert('I am not here. This is not happening.');
    if (e.target.status === 200) alert('Workspace updated.');
  };

  xhr.send(codeMirror.getValue());
};

// Load workspace in codemirror.
const xhr = new XMLHttpRequest();
xhr.open('GET', document.head.dataset.dir + '/api/workspace/get?token=' + document.body.dataset.token);
xhr.responseType = 'json';
xhr.onload = e => {
  codeMirror.setValue(JSON.stringify(e.target.response, null, '  '));
  codeMirror.refresh();

  console.log(codeMirror.getValue());
};
xhr.send();

}