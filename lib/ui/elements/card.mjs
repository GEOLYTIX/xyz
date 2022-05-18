export default (params) => mapp.utils.html.node`
  <div 
    data-id=${params.data_id || 'card'}
    class="drawer">
    <div class="header bold">
      <span>${params.header}</span>
      <button
        data-id=close
        class="mask-icon close"
        onclick=${e => {
          e.target.closest(".drawer").remove()
          params.close && params.close(e)
        }}>
    </div>
    ${params.content}`;