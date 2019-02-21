import location from './location.mjs';

export default _xyz => {

  return {

    select: select,

    location: location(_xyz),

  };

  function select(location, callback) {

    if (!location) return;

    if (_xyz.locations.current) _xyz.locations.current.remove();

    Object.assign(location, _xyz.locations.location());

    _xyz.locations.current = location;

    if (!callback) callback = location => {

      location.draw();

      if(!_xyz.mapview.popup || !location.marker) return alert(JSON.stringify(location.infoj, _xyz.utils.getCircularReplacer(), ' '));

      _xyz.mapview.popup({
        latlng: [location.marker[1], location.marker[0]],
        content: location.view.node
      });
    };

    location.get(callback);

    return location;

  };

};