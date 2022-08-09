mapp.utils.merge(mapp.dictionaries, {
  en: {
    here_mode: "Mode",
    here_mode_driving: "driving",
    here_mode_walking: "walking",
    here_range_minutes: "Travel time in minutes",
    here_datetime_arrive: "Arrive at",
    here_datetime_depart: "Depart at",
    here_optimize_for: "Optimize for",
    here_optimize_for_balanced: "balanced",
    here_optimize_for_quality: "quality",
    here_optimize_for_performance: "performance",
  },
  de: {
    here_mode: "Modus",
    here_mode_driving: "Kraftfahrzeug",
    here_mode_walking: "zu Fuß",
    here_range_minutes: "Fahrzeit in Minuten",
    here_datetime_arrive: "Ankunft",
    here_datetime_depart: "Abfahrt",
    here_optimize_for: "Optimisierung",
    here_optimize_for_balanced: "Ausgeglichen",
    here_optimize_for_quality: "Qualität",
    here_optimize_for_performance: "Leistung",
  },
  cn: {
    here_mode_driving: "机动车行",
    here_mode_walking: "步行",
    here_range_minutes: "以分钟计交通时间 ",
  },
  pl: {
    here_mode: "Środek transportu",
    here_mode_driving: "samochodem",
    here_mode_walking: "piechotą",
    here_range_minutes: "Czas podróży w minutach",
    here_datetime_arrive: "Rozpocznij",
    here_datetime_depart: "Osiągnij cel",
    here_optimize_for: "Optymalizacja",
    here_optimize_for_balanced: "zrównoważona",
    here_optimize_for_quality: "jakość",
    here_optimize_for_performance: "wydajność",
  },
  ko: {
    here_mode_driving: "운전",
    here_mode_walking: "도보",
    here_range_minutes: "여행시간(분) ",
  },
  fr: {
    here_mode: "Type de transport",
    here_mode_driving: "en voiture",
    here_mode_walking: "à pied",
    here_range_minutes: "Temps du trajet en minutes",
    here_datetime_depart: "Partir à",
    here_datetime_arrive: "Arriver à",
    here_optimize_for: "Optimiser",
    here_optimize_for_balanced: "l'équilibre",
    here_optimize_for_quality: "la qualité",
    here_optimize_for_performance: "les performances",
  },
  ja: {
    here_mode_driving: "ドライビング",
    here_mode_walking: "ウォーキング",
    here_range_minutes: "移動時間 (分) ",
  }
})

export default (params) => {
  
  const modeDropDown = mapp.utils.html.node`
    <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.here_mode}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({
          entries: [
            {
              title: [mapp.dictionary.here_mode_driving],
              option: "car",
            },
            {
              title: [mapp.dictionary.here_mode_walking],
              option: "pedestrian",
            },
          ],
          callback: (e, entry) => {
            params.transportMode = entry.option;
          }
        })}`

  const optimisedForDropDown = mapp.utils.html.node`
    <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.here_optimize_for}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({
          entries: [
            {
              title: [mapp.dictionary.here_optimize_for_balanced],
              option: "balanced",
            },
            {
              title: [mapp.dictionary.here_optimize_for_quality],
              option: "quality",
            },
            {
              title: [mapp.dictionary.here_optimize_for_performance],
              option: "performance",
            },
          ],
          callback: (e, entry) => {
            params.optimizeFor = entry.option;
          },
        })}`       
    
  let date_picker_label = mapp.utils.html.node`
    <span>${mapp.dictionary.here_datetime_depart}`

  let dateSelect = mapp.utils.html.node`
    <input
      type="datetime-local"
      onchange=${e => {
        const reverseDirectionChk = paramsDrawer.querySelector('[data-id=reverse_direction] > input')

        if (e.target.value) {
          
          params.dateISO = new Date(e.target.value).toISOString()

          // reverse direction not valid in combination with a dateISO param.
          if (reverseDirectionChk) {
            params.reverseDirection = false
            reverseDirectionChk.checked = false
            reverseDirectionChk.disabled = true
          }

        } else {

          params.dateISO = undefined
          if (reverseDirectionChk) reverseDirectionChk.disabled = false
        }
      }}>`;

  const datePicker = mapp.utils.html.node`
    <div>
      ${date_picker_label}
      ${dateSelect}`

        
  const rangeSlider = mapp.ui.elements.slider({
    label: mapp.dictionary.here_range_minutes,
    min: params.rangeMin,
    max: params.rangeMax,
    val: 10,
    callback: e => {
      params.range = parseInt(e.target.value)
    }
  })

  const reverseDirectionChk = typeof params.reverseDirection !== 'undefined' && mapp.ui.elements.chkbox({
    label: 'Reverse Direction Isoline',
    data_id: 'reverse_direction',
    checked: !!params.reverseDirection,
    onchange: (checked) => {
      date_picker_label.textContent = checked && mapp.dictionary.here_datetime_arrive || mapp.dictionary.here_datetime_depart
      params.reverseDirection = checked      
    }})

  const paramsDrawer = mapp.ui.elements.drawer({
    header: mapp.utils.html`
      <h3>Here Isoline</h3>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`<div class="panel">
      <div style="display: grid; grid-row-gap: 5px;">
        ${modeDropDown}
        ${optimisedForDropDown}
        ${datePicker}
        ${reverseDirectionChk || ''}
        ${rangeSlider}`
  })

  return paramsDrawer

}