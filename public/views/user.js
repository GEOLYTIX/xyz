const token = document.body.dataset.token;

const xhr = new XMLHttpRequest();

xhr.open('GET', document.head.dataset.dir + '/user/list?token=' + token);

xhr.setRequestHeader('Content-Type', 'application/json');
xhr.responseType = 'json';

xhr.onload = e => {

  if (e.target.status !== 200) return;

  const userTable = new Tabulator(
    document.getElementById('userTable'),
    {
      columns: [
        {
          field: 'email',
          headerTooltip: 'Account EMail',
          titleFormatter: ()=> '<i class="material-icons">face</i>',
        },
        {
          field: 'verified',
          align: 'center',
          headerTooltip: 'The account email has been verified through a token sent to the email address.',
          titleFormatter: ()=> '<i class="material-icons">done</i>',
          formatter: 'tickCross',
          cellClick: cellToggle,
        },
        {
          field: 'approved',
          align: 'center',
          headerTooltip: 'The account has been approved by a site administrator and is permitted to access the application.',
          titleFormatter: ()=> '<i class="material-icons">done_all</i>',
          formatter: 'tickCross',
          cellClick: cellToggle,
        },
        {
          field: 'admin_user',
          align: 'center',
          headerTooltip: 'The account is an admin account which can access this page and change other account credentials.',
          titleFormatter: ()=> '<i class="material-icons">supervisor_account</i>',
          formatter: 'tickCross',
          cellClick: cellToggle,
        },
        {
          field: 'admin_workspace',
          align: 'center',
          headerTooltip: 'The account has priviliges to modify the workspace.',
          titleFormatter: ()=> '<i class="material-icons">settings</i>',
          formatter: 'tickCross',
          cellClick: cellToggle,
        },
        {
          field: 'failedattempts',
          align: 'center',
          headerTooltip: 'Failed login attempts.',
          titleFormatter: ()=> '<i class="material-icons">warning</i>',
          formatter: (cell, formatterParams) => '<span style="color:red; font-weight:bold;">' + cell.getValue() + '</span>',
        },
        {
          field: 'roles',
          title: 'Roles',
          headerTooltip: 'Account roles',
          headerSort: false,
          //editor: roleEdit,
        },
        {
          field: 'access_log',
          title: 'Access Log',
          headerTooltip: 'Click last access log entry for full access log array.',
          cellClick: getAccessLog,
        },
        {
          field: 'approved_by',
          title: 'Approved by',
          headerTooltip: 'Admin who approved last modification to this account.',
        },
        {
          field: 'blocked',
          align: 'center',
          headerTooltip: 'Blocked accounts can no longer login or reset their password.',
          titleFormatter: ()=> '<i class="material-icons">lock</i>',
          formatter: 'tickCross',
          cellClick: cellToggle,
        },
        {
          field: 'delete',
          headerSort: false,
          formatter: ()=> '<span style="color:red; font-weight:bold;">DELETE</span>',
          cellClick: rowDelete,
        }
      ],
      // autoResize: false,
      //columnVertAlign: 'middle',
      resizableColumns: false,
      resizableRows: false,
      layout: 'fitDataFill',
      // layoutColumnsOnNewData: true,
      // height: _xyz.tableview.height || '100%'
    });

  userTable.setData(e.target.response);

  userTable.redraw(true);

};

xhr.send();

function cellToggle(e, cell) {

  const user = cell.getData();

  const col = cell.getColumn();

  xhr.open(
    'GET',
    document.head.dataset.dir + 
    '/user/update' + 
    '?email=' + user.email +
    '&role=' + col.getField() +
    '&chk=' + !cell.getValue() +
    '&token=' + token);

  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = () => {
    if (xhr.status === 500) alert('Soz. It\'s me not you.');
    if (xhr.status === 200) cell.setValue(!cell.getValue());
  };

  xhr.send();

};

function getAccessLog(e, cell) {

  const user = cell.getData();

  xhr.open(
    'GET',
    document.head.dataset.dir + 
    '/user/log' + 
    '?email=' + user.email +
    '&token=' + token);

  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = e => {
    if (xhr.status === 500) alert('Soz. It\'s me not you.');
    if (xhr.status === 200) alert(e.target.response.join('\n'));
  };

  xhr.send();

};

function rowDelete(e, cell) {

  const user = cell.getData();

  const row = cell.getRow();

  if (confirm('Delete account ' + user.email)) {

    xhr.open(
      'GET',
      document.head.dataset.dir +
      '/user/delete?' +
      'email=' + user.email +
      '&token=' + token);

    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = e => {
      if (e.target.status === 500) alert('Soz. It\'s me not you.');
      if (e.target.status === 200) row.delete();
    };

    xhr.send();
  }

};

function roleEdit(cell, onRendered, success, cancel, editorParams){
  //cell - the cell component for the editable cell
  //onRendered - function to call when the editor has been rendered
  //success - function to call to pass the successfuly updated value to Tabulator
  //cancel - function to call to abort the edit and return to a normal cell
  //editorParams - params object passed into the editorParams column definition property

  //create and style editor
  var editor = document.createElement('select');


  var option = document.createElement('option');

  option.textContent = 'foo';

  editor.appendChild(option);

  var option = document.createElement('option');

  option.textContent = 'boo';

  editor.appendChild(option);



  //editor.setAttribute('type', 'date');

  //create and style input
  // editor.style.padding = '3px';
  // editor.style.width = '100%';
  // editor.style.boxSizing = 'border-box';

  //Set value of editor to the current value of the cell
  //editor.value = cell.getValue();

  //set focus on the select box when the editor is selected (timeout allows for editor to be added to DOM)
  onRendered(function(){
    editor.focus();
    editor.style.css = '100%';
  });

  //when the value has been set, trigger the cell to update
  function successFunc(){
    alert(editor.value);
  }

  editor.addEventListener('change', successFunc);
  editor.addEventListener('blur', successFunc);

  //return the editor element
  return editor;
};
