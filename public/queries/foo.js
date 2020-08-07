document.dispatchEvent(new CustomEvent('foo', { detail: addModule }))

function addModule(_xyz) {

  console.log(_xyz.locale.modules.foo)

  _xyz.locale.modules.foo = word => {
    console.log(word)
  }

}