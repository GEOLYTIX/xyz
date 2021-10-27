window.onload = async () => {

const rolesList = await xhrPromise(`${document.head.dataset.dir}/api/workspace/get/roles`)

const params = {}

window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, (match, key, value) => {
  params[key] = decodeURI(value)
})

const response = await xhrPromise(`${document.head.dataset.dir}/api/user/list`)

const data = response.length && response || [response]

if (params.email) {
  data.sort(function(x,y){ return x.email == params.email ? -1 : y.email == params.email ? 1 : 0; });
}

new Tabulator(document.getElementById('userTable'),
  {
    rowFormatter: row => {
  
      const user = row.getData()

      row.getElement().style.backgroundColor = user.email === params.email && '#fff9c4'
  
      row.getElement().style.backgroundColor = user.blocked && '#ef9a9a'

    },
    columns: [
      {
        field: 'email',
        headerTooltip: 'Account EMail',
        titleFormatter: ()=> '<div class="icon-face xyz-icon"></div>',
      },
      {
        field: 'verified',
        align: 'center',
        headerTooltip: 'The account email has been verified through a token sent to the email address.',
        titleFormatter: ()=> '<div class="icon-tick-done xyz-icon"></div>',
        formatter: 'tickCross',
        cellClick: cellToggle,
      },
      {
        field: 'approved',
        align: 'center',
        headerTooltip: 'The account has been approved by a site administrator and is permitted to access the application.',
        titleFormatter: ()=> '<div class="icon-tick-done-all xyz-icon"></div>',
        formatter: 'tickCross',
        cellClick: cellToggle,
      },
      {
        field: 'admin',
        align: 'center',
        headerTooltip: 'The account is an admin account which can access this page and change other account credentials.',
        titleFormatter: ()=> '<div class="xyz-icon icon-supervisor-account"></div>',
        formatter: 'tickCross',
        cellClick: cellToggle,
      },
      {
        field: 'api',
        align: 'center',
        headerTooltip: 'The account has priviliges to create API keys.',
        titleFormatter: ()=> '<div class="xyz-icon icon-key"></div>',
        formatter: 'tickCross',
        cellClick: cellToggle,
      },
      {
        field: 'failedattempts',
        align: 'center',
        headerTooltip: 'Failed login attempts.',
        titleFormatter: ()=> '<div class="xyz-icon icon-warning"></div>',
        formatter: (cell, formatterParams) => '<span style="color:red; font-weight:bold;">' + cell.getValue() + '</span>',
      },
      {
        field: 'language',
        align: 'center',
        headerTooltip: 'Account language',
        titleFormatter: () => '<div class="xyz-icon icon-translate"></div>',
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
        titleFormatter: ()=> '<div class="icon-lock-closed xyz-icon"></div>',
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
    data: data
  });

async function cellToggle(e, cell) {

  const user = cell.getData();

  const col = cell.getColumn();

  const response = await xhrPromise(`${document.head.dataset.dir}/api/user/update?email=${user.email}&field=${col.getField()}&value=${!cell.getValue()}`);

  if (response.err) return console.error(response.err);

  cell.setValue(!cell.getValue());

  const row = cell.getRow();

  row.reformat();
};

async function getAccessLog(e, cell) {

  const user = cell.getData();

  const response = await xhrPromise(`${document.head.dataset.dir}/api/user/log?email=${user.email}`);

  if (response.err) return console.error(response.err);

  alert(response.access_log.join('\n'));
};

async function rowDelete(e, cell) {

  const user = cell.getData();

  const row = cell.getRow();

  if (confirm('Delete account ' + user.email)) {

    const response = await xhrPromise(`${document.head.dataset.dir}/api/user/delete?email=${user.email}`);

    if (response.err) return console.error(response.err);

    row.delete();
  }
};

function roleEdit(cell, onRendered, success, cancel, editorParams){
 
  let cellValues = cell.getValue()

  const user = cell.getData()

  const cellElement = cell.getElement()
  cellElement.style.overflow = 'visible';
  cellElement.style.border = 'none';
  
  // cellElement.addEventListener("blur", blur, {once: true});

  // let successTimeout;
  // function blur() {
  //   console.log('setTimeout')
  //   successTimeout = setTimeout(()=>{
  //     console.log('cancel')
  //     cancel(cellValues)
  //     cellElement.removeEventListener("blur", blur);
  //   },400)
  // }

  const editor = uhtml.html.node`
  <button
    class="btn-drop active">
      <div
        class="head"
        onclick=${(e) => {
          cellElement.style.overflow = 'hidden';
          success(cellValues)
        }}>
        <span>${cellValues}</span>
        <div class="icon"></div>
      </div>
      <ul>${rolesList.map((val) => uhtml.html`
        <li 
        class="${cellValues.some(role => role === val) && 'selected' || ''}"
        onclick=${async (e) => {
          e.stopPropagation()

          // clearTimeout(successTimeout)
          // console.log('clearTimeout')
          // cellElement.removeEventListener("blur", blur);

          const drop = e.target.closest('.btn-drop')
          drop.classList.toggle('active')

          e.target.classList.toggle('selected')
        
          if (e.target.classList.contains('selected')) {
            
            if (cellValues[0] === '') {
              cellValues[0] = val
            } else {
              cellValues.push(val)
            }

          } else {
            cellValues = cellValues.filter(role => role !== val)
          }
                
          const span = drop.querySelector('span')
          span.textContent = cellValues

          cellElement.style.overflow = 'hidden';

          await xhrPromise(document.head.dataset.dir + 
            '/api/user/update' + 
            '?email=' + user.email +
            '&field=roles' +
            '&value='+ cellValues)

          success(cellValues);

        }}>${val}`)}`

  return editor
};

}

function xhrPromise(req) {
  return new Promise((resolve, reject) => {

    const xhr = new XMLHttpRequest()

    xhr.open('GET', req)

    xhr.setRequestHeader('Content-Type', 'application/json')
   
    xhr.responseType = 'json'
  
    xhr.onload = e => {
  
      if (e.target.status >= 300) return reject({ err: e.target.status })
   
      resolve(e.target.response || {})
    }
  
    xhr.send()

  })
}