import workspace from './workspace.mjs';

import locale from './locale.mjs';

export default _xyz => {

  workspace(_xyz);

  locale(_xyz);

  _xyz.init = async params => {

    // Set XYZ Host.
    _xyz.host = params.host;

    if (!_xyz.host) return console.error('XYZ host not defined!');

    if (params.token) _xyz.token = params.token;

    // Get workspace from XYZ host.
    // Proceed with init from callback.
    if (params.callback) return _xyz.setWorkspace(params);

    // Fetch workspace if no callback is provided.
    _xyz.ws = await _xyz.fetchWorkspace();

    return _xyz;

  };

};