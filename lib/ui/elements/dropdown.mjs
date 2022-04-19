export default (params) => mapp.utils.html`
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
        btn.querySelector("[data-id=header-span]").textContent = entry.title;

        params.callback && params.callback(e, entry);
      }}>${entry.title}`

)}`;