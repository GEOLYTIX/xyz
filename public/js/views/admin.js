const token = document.body.dataset.token;

const xhr = new XMLHttpRequest();

xhr.open('GET', document.head.dataset.dir + '/auth/user/list?token=' + token);

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
          field: 'admin',
          align: 'center',
          headerTooltip: 'The account is an admin account which can access this page and change other account credentials.',
          titleFormatter: ()=> '<i class="material-icons">font_download</i>',
          formatter: 'tickCross',
          cellClick: cellToggle,
        },
        {
          field: 'failedattempts',
          align: 'center',
          headerTooltip: 'Failed login attempts.',
          titleFormatter: ()=> '<i class="material-icons">warning</i>',
          formatter: (cell, formatterParams) => '<span style="color:red; font-weight:bold;">' + cell.getValue() + '</span>',
          // cellClick: cellToggle,
        },
        {
          field: 'access_log',
          title: 'Access Log',
          cellClick: getAccessLog,
        },
        {
          field: 'approved_by',
          title: 'Approved by',
        },
        {
          field: 'blocked',
          align: 'center',
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

  //userTable.redraw(true);

};

xhr.send();

function cellToggle(e, cell) {

  const user = cell.getData();

  const col = cell.getColumn();

  xhr.open(
    'GET',
    document.head.dataset.dir + 
    '/auth/user/update' + 
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
    '/auth/user/log' + 
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
      '/auth/user/delete?' +
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