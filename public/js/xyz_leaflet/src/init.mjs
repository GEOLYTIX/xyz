import workspace from './workspace.mjs';

export default _xyz => {

  _xyz.workspace = workspace(_xyz);

  _xyz.init = async params => {

    // Set XYZ Host.
    _xyz.host = params.host;

    if (!_xyz.host) return console.error('XYZ host not defined!');

    if (params.token) _xyz.token = params.token;

    // Get workspace from XYZ host.
    // Proceed with init from callback.
    if (params.callback) return _xyz.workspace.setWS(params);

    // Fetch workspace if no callback is provided.
    await _xyz.workspace.fetchWS();

    return _xyz;

  };

};