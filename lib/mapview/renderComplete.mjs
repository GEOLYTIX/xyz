export default async function () {

  //const mapview = this

  await new Promise(resolve => {

    this.Map.once('rendercomplete', resolve)

  })

  console.log('wait')

}