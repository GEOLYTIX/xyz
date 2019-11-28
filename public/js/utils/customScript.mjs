export function customScript(url) {

  // create absolute URL
  // const a = document.createElement("a");
  // a.setAttribute("href", url);
  // const absURL = a.cloneNode(false).href;

  return new Promise((resolve, reject) => {

    const script = Object.assign(
      document.createElement("script"), {
      src: url,
      onerror: () => reject(new Error(`Failed to import: ${url}`)),
      onload: () => resolve()
    });

    document.head.appendChild(script);
  });
}