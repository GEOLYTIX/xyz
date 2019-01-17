import requestData from './requestData.mjs';

import setData from './setData.mjs';

import addData from './addData.mjs';

import download from './download.mjs';

import refresh from './refresh.mjs';

import content from './content.mjs';

export default _xyz => {

  _xyz.tableview.requestData = requestData(_xyz);

  _xyz.tableview.setData = setData(_xyz);

  _xyz.tableview.addData = addData(_xyz);

  _xyz.tableview.download = download(_xyz);

  _xyz.tableview.refresh = refresh(_xyz);

  _xyz.tableview.content = content(_xyz);

};
