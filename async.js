const templates = {
  "uk_airport": {
    "src": "cloudfront:${CDN}/templates/uk/airport.json"
  },
  "uk_catchment_statistics": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/catchment_statistics/layer.json"
  },
  "uk_catchment_statistics_demographics": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/catchment_statistics/demographics.sql"
  },
  "uk_catchment_statistics_grocery_summary": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/catchment_statistics/grocery_summary.sql"
  },
  "uk_health": {
    "src": "cloudfront:${CDN}/templates/uk/health.json"
  },
  "uk_lad": {
    "src": "cloudfront:${CDN}/templates/uk/lad/layer.json"
  },
  "uk_lad_demographics": {
    "src": "cloudfront:${CDN}/templates/uk/lad/demographics.sql"
  },
  "uk_lad_grocery_summary": {
    "src": "cloudfront:${CDN}/templates/uk/lad/grocery_summary.sql"
  },
  "uk_legal": {
    "src": "cloudfront:${CDN}/templates/uk/legal.json"
  },
  "uk_leisure": {
    "src": "cloudfront:${CDN}/templates/uk/leisure.json"
  },
  "uk_postal_area": {
    "src": "cloudfront:${CDN}/templates/uk/postal_area/layer.json"
  },
  "uk_postal_area_demographics": {
    "src": "cloudfront:${CDN}/templates/uk/postal_area/demographics.sql"
  },
  "uk_postal_area_grocery_summary": {
    "src": "cloudfront:${CDN}/templates/uk/postal_area/grocery_summary.sql"
  },
  "uk_postal_district": {
    "src": "cloudfront:${CDN}/templates/uk/postal_district/layer.json"
  },
  "uk_postal_district_demographics": {
    "src": "cloudfront:${CDN}/templates/uk/postal_district/demographics.sql"
  },
  "uk_postal_district_grocery_summary": {
    "src": "cloudfront:${CDN}/templates/uk/postal_district/grocery_summary.sql"
  },
  "uk_postal_sector": {
    "src": "cloudfront:${CDN}/templates/uk/postal_sector/layer.json"
  },
  "uk_postal_sector_demographics": {
    "src": "cloudfront:${CDN}/templates/uk/postal_sector/demographics.sql"
  },
  "uk_postal_sector_grocery_summary": {
    "src": "cloudfront:${CDN}/templates/uk/postal_sector/grocery_summary.sql"
  },
  "uk_road_traffic": {
    "src": "cloudfront:${CDN}/templates/uk/road_traffic.json"
  },
  "uk_region": {
    "src": "cloudfront:${CDN}/templates/uk/region/layer.json"
  },
  "uk_region_demographics": {
    "src": "cloudfront:${CDN}/templates/uk/region/demographics.sql"
  },
  "uk_region_grocery_summary": {
    "src": "cloudfront:${CDN}/templates/uk/region/grocery_summary.sql"
  },
  "uk_retail_places": {
    "src": "cloudfront:${CDN}/templates/uk/retail_places.json"
  },
  "uk_retail_places_shopping_centre": {
    "src": "cloudfront:${CDN}/templates/uk/retail_places_shopping_centre.json"
  },
  "uk_seamless_towns_and_suburbs": {
    "src": "cloudfront:${CDN}/templates/uk/seamless_towns_and_suburbs.json"
  },
  "uk_shopper_town": {
    "src": "cloudfront:${CDN}/templates/uk/shopper_town.json"
  },
  "uk_shopper_town table": {
    "src": "cloudfront:${CDN}/templates/uk/shopper_town_table.sql"
  },
  "uk_shopper_town retail_points": {
    "src": "cloudfront:${CDN}/templates/uk/shopper_town_retail_points.sql"
  },
  "uk_shopper_town population_growth": {
    "src": "cloudfront:${CDN}/templates/uk/shopper_town_population_growth.sql"
  },
  "uk_shopper_town oac_profile": {
    "src": "cloudfront:${CDN}/templates/uk/shopper_town_oac_profile.sql"
  },
  "uk_shopper_town grocery_demand": {
    "src": "cloudfront:${CDN}/templates/uk/shopper_town_grocery_demand.sql"
  },
  "uk_site": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/layer.json"
  },
  "uk_sites_age_profile_vs_uk": {
    "type": "module",
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_age_profile_vs_uk.js"
  },
  "uk_sites_age_profile": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_age_profile_breakdown.sql"
  },
  "uk_sites_disposable_income": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_disposable_income.sql"
  },
  "uk_sites_ethnicity": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_ethnicity.sql"
  },
  "uk_sites_home_ownership": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_home_ownership.sql"
  },
  "uk_sites_keystats": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_keystats.sql"
  },
  "uk_sites_oac_profile": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_oac_profile.sql"
  },
  "uk_sites_population_growth": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_population_growth.sql"
  },
  "uk_sites_population_summary": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_population_summary.sql"
  },
  "uk_sites_retail_places_nearby": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_retail_places_nearby.sql"
  },
  "uk_sites_social_grade_breakdown": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_social_grade_breakdown.sql"
  },
  "uk_sites_social_grade_profile": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_social_grade_profile.sql"
  },
  "uk_sites_social_grade_vs_uk": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_social_grade_vs_uk.sql"
  },
  "uk_sites_stores_convenience": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_stores_convenience.sql"
  },
  "uk_sites_stores_supermarkets": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_stores_supermarkets.sql"
  },
  "uk_sites_workers_radial_count": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_workers_radial_count.sql"
  },
  "uk_sites_workers_split_labels": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_workers_split_labels.sql"
  },
  "uk_sites_workers_split": {
    "src": "cloudfront:${CDN}/mapp/templates/uk/site/sites_workers_split.sql"
  },
  "uk_university_student_count": {
    "src": "cloudfront:${CDN}/templates/uk/university_student_count.json"
  },
  "uk_demography_grid": {
    "src": "cloudfront:${CDN}/templates/uk/demography_grid.json"
  },
  "uk_workers": {
    "src": "cloudfront:${CDN}/templates/uk/workers.json"
  },
  "uk_workers_occupation_split": {
    "src": "cloudfront:${CDN}/templates/uk/workers_occupation_split.sql"
  },
  "uk_university_building": {
    "src": "cloudfront:${CDN}/templates/uk/university_building.json"
  },
  "uk_schools": {
    "src": "cloudfront:${CDN}/templates/uk/schools.json"
  },
  "uk_university_poi": {
    "src": "cloudfront:${CDN}/templates/uk/university_poi.json"
  },
  "uk_rail_stations": {
    "src": "cloudfront:${CDN}/templates/uk/rail_stations.json"
  },
  "uk_railways": {
    "src": "cloudfront:${CDN}/templates/uk/railways.json"
  },
  "uk_roads": {
    "src": "cloudfront:${CDN}/templates/uk/roads.json"
  },
  "uk_traffic": {
    "src": "cloudfront:${CDN}/templates/uk/traffic.json"
  },
  "uk_grocery": {
    "src": "cloudfront:${CDN}/templates/uk/grocery.json"
  }
}


const { join } = require('path')

const { readFileSync } = require('fs')

const pem = readFileSync(join(__dirname, `./APKAIXPS7PELCXCPMOWQ.pem`))

const AWS = require("aws-sdk")

const awsSigner = process.env.KEY_CLOUDFRONT && new AWS.CloudFront.Signer(
  'APKAIXPS7PELCXCPMOWQ',
  String(pem)
)

const fetch = require('node-fetch')

const cloudfront = ref => new Promise((resolve, reject) => {

  let url = ref.params && ref.params.url || ref

  url = url.replace(/\{(.*?)\}/g,
      matched => process.env[`SRC_${matched.replace(/\{|\}/g, '')}`] || matched)

  const signedURL = awsSigner.getSignedUrl({
    url: `https://${url}`,
    expires: Date.now() + 60 * 60 * 1000 // 1 hour
  })

  console.time(url)

  return fetch(signedURL)
    .then(response => {

      console.timeEnd(url)

      if (response.status >= 300) reject(new Error(`${response.status} ${ref}`))

      if (url.match(/\.json$/i)) {
        //const json = await response.json()
        // console.log('json')
        return response.json()
      }

      // console.log('text')

      //const text = await response.text()
      return response.text()
    })
    .then(resolve)

})


const templatePromises = Object.entries(templates).map(
  entry => {

    // Entries without a src value must not be fetched.
    if (!entry[1].src) return Promise.resolve('foo')

    // Substitute SRC_* parameter.
    entry[1].src = entry[1].src.replace(/\$\{(.*?)\}/g,
      matched => process.env[`SRC_${matched.replace(/\$|\{|\}/g, '')}`] || matched)

    
      if (entry[1].src && entry[1].src.startsWith('cloudfront:')) {

        return cloudfront(entry[1].src.split(':')[1])
          //.then(_resolve)
      }


    if (entry[1].src && entry[1].src.startsWith('https:')) {

      return fetch(entry[1].src)
    }

  })


console.time('promise all')

Promise
  .all(templatePromises)
  .then(arr => {

    arr.forEach(r=>{
      console.log(r.length)
    })

    // arr.map(r => {
    //   console.log(r)
    // })
    
    // Object.assign(templates, ...arr)

    // console.log(templates)
    console.timeEnd('promise all')
  })
  .catch(error => {
    console.error(error)
    //reject()
  })