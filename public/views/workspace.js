const codeMirror = CodeMirror(document.getElementById('codemirror'), {
  value: '{}',
  lineNumbers: true,
  mode: 'application/json',
  gutters: ['CodeMirror-lint-markers'],
  // foldGutter: true,
  // gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
  lint: true,
  lineWrapping: true,
  autofocus: true,
});

const btnFile = document.getElementById('btnFile');

const fileInput = document.getElementById('fileInput');

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

btnFile.onclick = () => fileInput.click();


const btnUpload = document.getElementById('btnUpload');

btnUpload.onclick = () => {

  const xhr = new XMLHttpRequest();
  xhr.open('POST', document.head.dataset.dir + '/workspace/load?token=' + document.body.dataset.token);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = e => {
    if (e.target.status !== 200) alert('I am not here. This is not happening.');

    // Set cleaned json to editor;
    codeMirror.setValue(JSON.stringify(JSON.parse(e.target.response), null, '  '));
    codeMirror.refresh();

    // document.getElementById('workspace_mask').style.display = 'none';
  };

  // document.getElementById('workspace_mask').style.display = 'block';

  // let settings = {};

  // try {
  //   settings = codeMirror.getValue();
  // } catch (err) {
  //   console.error(err);
  // }

  xhr.send(JSON.stringify({
    settings: codeMirror.getValue()
  }));

  // xhr.send({
  //   settings: codeMirror.getValue()
  // });
  
};



const xhr = new XMLHttpRequest();

xhr.open('GET', document.head.dataset.dir + '/workspace/get?token=' + document.body.dataset.token);

xhr.responseType = 'json';

xhr.onload = e => {

  codeMirror.setValue(JSON.stringify(e.target.response, null, '  '));

  codeMirror.refresh();

};

xhr.send();