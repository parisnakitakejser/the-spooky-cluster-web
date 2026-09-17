Photographs for the about page.

Drop JPEGs in here and set `file` on the matching entry in
`app/pages/about.vue`. A slot with an empty `file` renders as a blank panel
rather than a broken image, so the page stays presentable until the photo
exists.

Give each entry a `width` and `height` too — the intrinsic size stops the
page jumping while the image loads.

Suggested, matching the slots already on the page:

    portrait.jpg          you, for the circle in the about intro (crop square)
    rack-front.jpg        the cabinet, doors open
    rack-rear-cabling.jpg the three vertical runs
    ossuary-chassis.jpg   a Supermicro chassis with the lid off
    seance-nucs.jpg       the management cluster on its shelf
    the-garage.jpg        the room it all lives in

Resize before committing: 1600px on the long edge is plenty, and this
repository is not a place to keep 8 MB originals.
