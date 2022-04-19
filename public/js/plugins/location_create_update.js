export default (function () {

  async function update_location(create) {
    const loc = await create

    if (!loc.layer.update_fields) return loc;

    const newValues = {}

    if (loc.layer.update_fields.user) {
      newValues[loc.layer.update_fields.user] = mapp.user?.email
    }

    await mapp.utils.xhr({
      method: "POST",
      url: `${loc.layer.mapview.host}/api/location/update?` +
        mapp.utils.paramString({
          locale: loc.layer.mapview.locale.key,
          layer: loc.layer.key,
          table: loc.layer.table,
          id: loc.id,
        }),
      body: JSON.stringify(newValues),
    });
    
    return loc
  }

  mapp.location.create = mapp.utils.compose(
    mapp.location.create,
    update_location)

})()