export default (function(){

  mapp.ui.locations.entries.update_entry = entry => {

    // Check whether the update method is already assigned to the entry.
    if (entry.update) return;

    // Assign update method to prevent multiple execution.
    entry.update = update

    function update() {

      // Find entry to update from params.field value.
      const field_entry = entry.location.infoj.find(_entry => _entry.field === entry.params.field)

      // Check whether field_entry value is already set to prevent multiple execution.
      if (field_entry.value === (mapp.user?.email || 'anonymous')) return;

      // Assign user email or anonymous if not known as newValue.
      field_entry.newValue = mapp.user?.email || 'anonymous'

      // Update the location.
      entry.location.update()
    }

    // Push update method into location updateCallbacks array.
    entry.location.updateCallbacks.push(update)
  }

})()