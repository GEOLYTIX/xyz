(() => {
    if (!document.getElementById('language')) return;
    let href = new URL(window.location.href);
    let lang = href.searchParams.get("language");
    document.getElementById('language').value = lang ? lang : 'en';
})();

if (document.getElementById('language')) document.getElementById('language').addEventListener('change', e => {

    let lang = e.target.value;
    let href = new URL(window.location.href);
    href.searchParams.get('language') ? href.searchParams.set('language', lang) : href.searchParams.append('language', lang);
    window.location.assign(href.toString());
});