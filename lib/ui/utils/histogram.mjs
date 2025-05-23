const histogram = {
    create,
    update
};
  
export default histogram;

async function create(params) {

    params.query ??= 'histogram';

    const queryparams = mapp.utils.queryParams(params);

    const paramString = mapp.utils.paramString(queryparams);

    params.host ??= params.layer?.mapview?.host;

    const response = await mapp.utils.xhr(
        `${params.host || mapp.host}/api/query?${paramString}`,
    );

    console.log(response);

}


async function update(params) {

    console.log('hello this is histogram update')
    
}
