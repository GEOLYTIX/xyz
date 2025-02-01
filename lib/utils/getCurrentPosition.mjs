/**
## mapp.utils.getCurrentPosition()

@module /utils/getCurrentPosition
*/

export default function (
  callback,
  options = {
    //enableHighAccuracy: false,
    //timeout: 3000,
    //maximumAge: 0
  },
) {
  navigator.geolocation.getCurrentPosition(
    callback,
    (err) => console.error(err),
    options,
  );
}
