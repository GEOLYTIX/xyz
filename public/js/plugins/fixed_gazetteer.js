document.dispatchEvent(new CustomEvent('fixed_gazetteer', {
  detail: _xyz => {

    document.getElementById('gazetteer').remove()

    const ctrl = document.getElementById('ctrls')

    ctrl.insertBefore(_xyz.utils.html.node`
    <div
      style="height: 50px;"
      class="mobile-display-none">`,
      ctrl.firstChild)

    document.body.insertBefore(_xyz.utils.html.node`
      <div id="gazetteer" class="display-none">
        <style>
          @media only screen and (min-width: 700px) {
            #btnGazetteer {
              display: none;
            }

            #gazetteer {
              z-index: 9999;
              grid-row: 1;
              grid-column: 1;
              height: 50px;
              padding: 10px;
              background-color: #f0f0f0;
              display: block;
            }
          }
        </style>
        <button id="closeGazetteer">
          <div class="xyz-icon icon-close"></div>
        </button>
        <div class="input-drop">
          <input type="text" placeholder="e.g. London">
          <ul></ul>
        </div>`, ctrl)

  }
}))