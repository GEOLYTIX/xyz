document.dispatchEvent(new CustomEvent('youtube_link', {
    detail: _xyz => {

        if (!document.getElementById('mapButton')) return

        document.getElementById('mapButton').appendChild(_xyz.utils.html.node`
        <button
          class="mobile-display-none"
            title="Mapp Introduction"
            onclick="window.open('https://youtu.be/ZK7ZPx2iMuQ', '_blank');"><div class="xyz-icon icon-school">`)
    }
}))