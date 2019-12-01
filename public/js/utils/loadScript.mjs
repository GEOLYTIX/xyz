export function loadScript(src) {

  // create absolute URL
  // const a = document.createElement("a");
  // a.setAttribute("href", src);
  // const absURL = a.cloneNode(false).href;

  return new Promise((resolve, reject) => {
    const script = Object.assign(
      document.createElement("script"), {
      src: src,
      onerror: () => reject(console.error('failed:'+src)),
      onload: () => resolve(console.log('loaded:'+src))
    });
  
    document.head.appendChild(script);
  });

}