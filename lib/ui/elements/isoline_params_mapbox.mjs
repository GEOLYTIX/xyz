mapp.utils.merge(mapp.dictionaries, {
  en: {
    mapbox_isoline: "Drive / Walk time (Source: Mapbox)",
    mapbox_mode: "Mode",
    mapbox_driving: "Driving",
    mapbox_walking: "Walking",
    mapbox_cycling: "Cycling",
    mapbox_travel_time: "Travel time in minutes",
  },
  de: {
    mapbox_isoline: "Fahrzeit (Source: Mapbox)",
    mapbox_mode: "Mode",
    mapbox_driving: "Kraftfahrzeug",
    mapbox_walking: "zu Fuß",
    mapbox_cycling: "Fahrrad",
    mapbox_travel_time: "Fahrzeit in Minuten",
  },
  cn: {
    mapbox_mode: "模式",
    mapbox_driving: "机动车行",
    mapbox_walking: "步行",
    mapbox_cycling: "骑行",
    mapbox_travel_time: "以分钟计交通时间",
  },
  pl: {
    mapbox_mode: "Typ",
    mapbox_driving: "Samochodem",
    mapbox_walking: "Piechotą",
    mapbox_cycling: "Rowerem",
    mapbox_travel_time: "Czas podróży w minutach",
  },
  ko: {
    mapbox_mode: "모드",
    mapbox_driving: "운전",
    mapbox_walking: "도보",
    mapbox_cycling: "사이클",
    mapbox_travel_time: "여행시간(분)",
  },
  fr: {
    mapbox_mode: "Mode",
    mapbox_driving: "En voiture",
    mapbox_walking: "À pied",
    mapbox_cycling: "À velo",
    mapbox_travel_time: "Temps du trajet en minutes ",
  },
  ja: {
    mapbox_mode: "モード",
    mapbox_driving: "ドライビング",
    mapbox_walking: "ウォーキング",
    mapbox_cycling: "サイクリング",
    mapbox_travel_time: "移動時間 (分)",
  }
})

export default (params) => {
  const modeDropDown = mapp.utils.html.node`
    <div 
      style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.mapbox_mode}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({
          entries: [
            {
              title: [mapp.dictionary.mapbox_driving],
              option: "driving",
            },
            {
              title: [mapp.dictionary.mapbox_walking],
              option: "walking",
            },
            {
              title: [mapp.dictionary.mapbox_cycling],
              option: "cycling",
            },
          ],
          callback: (e, entry) => {
            params.profile = entry.option;
          },
        })}`;

  const minuteSlider = mapp.ui.elements.slider({
    label: mapp.dictionary.mapbox_travel_time,
    min: params.minutesMin,
    max: params.minutesMax,
    val: params.minutes,
    callback: (e) => {
      params.minutes = parseInt(e.target.value);
    },
  });

  const paramsDrawer = mapp.ui.elements.drawer({
    header: mapp.utils.html`
      <h3>${mapp.dictionary.mapbox_isoline}</h3>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`<div class="panel">
      <div style="display: grid; grid-row-gap: 5px;">
        ${modeDropDown}
        ${minuteSlider}`
  });

  return paramsDrawer;
};