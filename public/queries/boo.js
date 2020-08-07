document.dispatchEvent(new CustomEvent('boo', { detail: addModule }))

function addModule(_xyz) {

  console.log(_xyz.locale.modules.boo)

  _xyz.locale.modules.boo = () => {
    console.log('boo')
  }

}