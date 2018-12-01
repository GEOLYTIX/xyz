export default (input, record, entry) => {

  if (!entry.value) entry.value = '';

  // Create newValue if input value is different from entry value.
  if (entry.value !== input.value) {

    entry.newValue = input.value;

    // Change styling of input and display upload button.
    record.upload.style.display = 'block';
    input.classList.add('changed');

  } else {

    // Delete newValue if it is the same as the entry value.
    delete entry.newValue;

    // Change styling of input.
    input.classList.remove('changed');

    // Hide upload button if no other field in the infoj has a newValue.
    if (!record.location.infoj.some(field => field.newValue)) record.upload.style.display = 'none';
  }

};