export default (input, entry) => {

  if (!entry.value) entry.value = '';

  // Create newValue if input value is different from entry value.
  if (entry.value !== input.value) {

    entry.newValue = input.value;
    input.classList.add('changed');

  } else {

    // Delete newValue if it is the same as the entry value.
    delete entry.newValue;

    // Change styling of input.
    input.classList.remove('changed');

  }

  if (entry.location.showUpload) entry.location.showUpload();

};