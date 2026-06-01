mapboxgl.accessToken = mapToken;

const coordinates = (listing.geometry && listing.geometry.coordinates) || [
  77.2089, 28.6139,
];

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: coordinates,
  zoom: 9,
});

const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`,
    ),
  )
  .addTo(map);
