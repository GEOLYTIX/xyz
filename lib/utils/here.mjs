/*
 * Copyright (C) 2019 HERE Europe B.V.
 * Licensed under MIT, see full license in LICENSE
 * SPDX-License-Identifier: MIT
 * License-Filename: LICENSE
 */

const DECODING_TABLE = [
    62, -1, -1, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, -1, -1, -1, -1, 63, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
    36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
];

const FORMAT_VERSION = 1;

const Num = typeof BigInt !== "undefined" ? BigInt : Number;

function decode(encoded, reverse) {
    const decoder = decodeUnsignedValues(encoded);
    const header = decodeHeader(decoder[0], decoder[1]);

    const factorDegree = 10 ** header.precision;
    const factorZ = 10 ** header.thirdDimPrecision;
    const { thirdDim } = header;

    let lastLat = 0;
    let lastLng = 0;
    let lastZ = 0;
    const res = [];

    let i = 2;
    for (;i < decoder.length;) {
        const deltaLat = toSigned(decoder[i]) / factorDegree;
        const deltaLng = toSigned(decoder[i + 1]) / factorDegree;
        lastLat += deltaLat;
        lastLng += deltaLng;

        if (thirdDim) {
            const deltaZ = toSigned(decoder[i + 2]) / factorZ;
            lastZ += deltaZ;
            res.push([lastLat, lastLng, lastZ]);
            i += 3;
        } else {
            res.push([lastLat, lastLng]);
            i += 2;
        }
    }

    if (i !== decoder.length) {
        throw new Error('Invalid encoding. Premature ending reached');
    }

    return {
        ...header,
        polyline: reverse ? res.map(p => p.reverse()) : res
    };
}

function decodeChar(char) {
    const charCode = char.charCodeAt(0);
    return DECODING_TABLE[charCode - 45];
}

function decodeUnsignedValues(encoded) {
    let result = Num(0);
    let shift = Num(0);
    const resList = [];

    encoded.split('').forEach((char) => {
        const value = Num(decodeChar(char));
        result |= (value & Num(0x1F)) << shift;
        if ((value & Num(0x20)) === Num(0)) {
            resList.push(result);
            result = Num(0);
            shift = Num(0);
        } else {
            shift += Num(5);
        }
    });

    if (shift > 0) {
        throw new Error('Invalid encoding');
    }

    return resList;
}

function decodeHeader(version, encodedHeader) {
    if (+version.toString() !== FORMAT_VERSION) {
        throw new Error('Invalid format version');
    }
    const headerNumber = +encodedHeader.toString();
    const precision = headerNumber & 15;
    const thirdDim = (headerNumber >> 4) & 7;
    const thirdDimPrecision = (headerNumber >> 7) & 15;
    return { precision, thirdDim, thirdDimPrecision };
}

function toSigned(val) {
    // Decode the sign from an unsigned value
    let res = val;
    if (res & Num(1)) {
        res = ~res;
    }
    res >>= Num(1);
    return +res.toString();
}

export default {
  decodeIsoline: decode,
  geometryFunction
}

function geometryFunction(coordinates, layer, params) {

  const geometry = new ol.geom.Circle(coordinates, params.range * 1000)

  const origin = ol.proj.transform(coordinates, `EPSG:${layer.mapview.srid}`, 'EPSG:4326')

  const _params = {
    'range[type]': params['range[type]'],
    'range[values]': params.range * 60,
    transportMode: params.transportMode,
    optimizeFor: params.optimizeFor,
    origin: `${origin[1]},${origin[0]}`
  }

  params.lat = origin[1]
  params.lon = origin[0]

  if (params.dateISO) {
    _params[params.reverseDirection && 'arrivalTime' || 'departureTime'] = new Date(params.dateISO).toISOString()
  }

  mapp.utils
    .xhr(`${layer.mapview.host}/api/proxy?url=${encodeURIComponent(`https://isoline.router.hereapi.com/v8/isolines?${mapp.utils.paramString(_params)}&{HERE}`)}`)
    .then(response => {

      if (!response.isolines) {
        console.log(response)
        return alert('Query failed.')
      }

      // Decode outer here isoline.
      const decoded = mapp.utils.here.decodeIsoline(response.isolines[0].polygons[0].outer, true)

      const feature = layer.mapview.interaction.format.readFeature({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [decoded.polyline]
        }
      }, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:' + layer.mapview.srid
      })

      layer.mapview.interaction.source.clear();

      layer.mapview.interaction.source.addFeature(feature);

    })

  return geometry
}