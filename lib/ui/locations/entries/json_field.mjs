export default entry => {

    console.log(entry.value)

    const jsonEntry = entry.location.infoj.find(_entry => _entry.field === entry.jsonField)

    if (!jsonEntry) return;

    console.log(jsonEntry.value)
}
