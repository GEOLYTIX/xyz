export default (input, location, entry) => {

  if (!entry.value) entry.value = '';

  // Create newValue if input value is different from entry value.
  if (entry.value !== input.value) {

    entry.newValue = input.value;

    // Change styling of input and display upload button.
    location.view.upload.style.display = 'block';
    input.classList.add('changed');

  } else {

    // Delete newValue if it is the same as the entry value.
    delete entry.newValue;

    // Change styling of input.
    input.classList.remove('changed');

    // Hide upload button if no other field in the infoj has a newValue.
    if (!location.infoj.some(field => field.newValue)) location.view.upload.style.display = 'none';
  }

};