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
          titleFormatter: ()=> '<div class="icons-face xyz-icon"></div>',
        },
        {
          field: 'verified',
          align: 'center',
          headerTooltip: 'The account email has been verified through a token sent to the email address.',
          titleFormatter: ()=> '<div class="icons-tick-done xyz-icon"></div>',
          formatter: 'tickCross',
          cellClick: cellToggle,
        },
        {
          field: 'approved',
          align: 'center',
          headerTooltip: 'The account has been approved by a site administrator and is permitted to access the application.',
          titleFormatter: ()=> '<div class="icons-tick-done-all xyz-icon"></div>',
          formatter: 'tickCross',
          cellClick: cellToggle,
        },
        {
          field: 'admin_user',
          align: 'center',
          headerTooltip: 'The account is an admin account which can access this page and change other account credentials.',
          titleFormatter: ()=> '<div class="icons-supervisor-account xyz-icon"></div>',
          formatter: 'tickCross',
          cellClick: cellToggle,
        },
        {
          field: 'admin_workspace',
          align: 'center',
          headerTooltip: 'The account has priviliges to modify the workspace.',
          titleFormatter: ()=> '<div class="icons-settings xyz-icon"></div>',
          formatter: 'tickCross',
          cellClick: cellToggle,
        },
        {
          field: 'failedattempts',
          align: 'center',
          headerTooltip: 'Failed login attempts.',
          titleFormatter: ()=> '<div class="icons-warning xyz-icon"></div>',
          formatter: (cell, formatterParams) => '<span style="color:red; font-weight:bold;">' + cell.getValue() + '</span>',
        },
        {
          field: 'roles',
          title: 'Roles',
          headerTooltip: 'Account roles',
          headerSort: false,
          editor: roleEdit,
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
          titleFormatter: ()=> '<div class="icons-lock-closed xyz-icon"></div>',
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
      resizableColumns: false,
      resizableRows: false,
      layout: 'fitDataFill',
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
    '&field=' + col.getField() +
    '&value=' + !cell.getValue() +
    '&token=' + token);

  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = () => {
    if (xhr.status !== 200) return alert(xhr.response.message);
    cell.setValue(!cell.getValue());
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

  const editor = document.createElement('input');

  editor.style.padding = '4px';
  editor.style.width = '100%';

  editor.value = cell.getValue();

  onRendered(()=>editor.focus());

  const user = cell.getData();

  editor.addEventListener('keyup', e => {
    let key = e.keyCode || e.charCode;

    if (key === 13) {

      editor.blur();

      xhr.open(
        'GET',
        document.head.dataset.dir + 
        '/user/update' + 
        '?email=' + user.email +
        '&field=roles' +
        '&value=' + editor.value +
        '&token=' + token);
    
      xhr.setRequestHeader('Content-Type', 'application/json');
    
      xhr.onload = () => {
        if (xhr.status !== 200) return alert(xhr.response.message);
        success(editor.value);
      };
    
      xhr.send();

    }

  });

  editor.addEventListener('blur', ()=>success(editor.value));

  return editor;
};