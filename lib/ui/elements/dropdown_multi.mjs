export default (params) => {

  const selectedTitles = new Set()
  const selectedOptions = new Set()

  return mapp.utils.html`
    <button 
      data-id=${params.data_id || 'dropdown'}
      class="dropdown">
      <div class="head"
        onclick=${(e) => {

          if (e.target.parentElement.classList.contains("active")) {
            e.target.parentElement.classList.remove("active");
            return;
          }

          document.querySelectorAll("button.dropdown")
            .forEach((el) => el.classList.remove("active"));
            
          e.target.parentElement.classList.add("active");

        }}>
        <span data-id=header-span>${params.span || params.placeholder || params.entries[0].title}</span>
        <div class="icon"></div>
      </div>
      <ul>${params.entries.map((entry) => mapp.utils.html.node`
        <li onclick=${(e) => {

          const btn = e.target.closest("button.dropdown")
          btn.classList.toggle("active")   

          e.target.classList.toggle('selected')

          if (e.target.classList.contains('selected')) {
            selectedTitles.add(entry.title)
            selectedOptions.add(entry.option)
          } else {
            selectedTitles.delete(entry.title)
            selectedOptions.delete(entry.option)
          }
                
          btn.querySelector("[data-id=header-span]")
            .textContent = Array.from(selectedTitles).join(', ')

          params.callback && params.callback(e, Array.from(selectedOptions));
        }}>${entry.title}`

  )}`;
}