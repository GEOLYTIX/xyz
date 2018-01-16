module.exports = function SVG_marker(letter, color) {

let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1000px" height="1000px"> \
            <g> \
            <path fill="#000" opacity="0.4" d="m 535,20 \
            c -200,0   -360,160  -360,360 \
                 0,80    20,140    70,230 \
              100,170   290,390   290,390 \
                0,0     190,-220  290,-390 \
               50,-90    70,-150   70,-230 \
              0,-200 -160,-360 -360,-360 Z"/> \
            <path fill="{COLOR}" d="m 500,10 \
            c -200,0   -360,160  -360,360 \
                 0,80    20,140    70,230 \
               100,170   290,390   290,390 \
                 0,0     190,-220  290,-390 \
                50,-90    70,-150   70,-230 \
                 0,-200 -160,-360 -360,-360 Z"/> \
            <circle fill="#fff" opacity="0.8" cx="500" cy="360" r="250"/> \
            </g> \
            <text x="500" y="360" \
              style="font-family: sans-serif; \
                     text-anchor: middle; \
                     alignment-baseline: central; \
                     font-size: 470px; \
                     font-weight: 600; \
                     fill: #555;">{LETTER} \
            </text> \
            </svg>';


    // let svg = '%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22512%22%20height%3D%22512%22%20viewBox%3D%220%200%20512%20512%22%3E%0A%3Cg%3E%0A%3Cpath%20fill%3D%22'
    //     + colours[0] + '%22%20d%3D%22M256.292%2C12.781c-98.628%2C0-178.585%2C79.955-178.585%2C178.585c0%2C42.256%2C13.724%2C77.289%2C34.268%2C113.638%20c48.065%2C85.042%2C144.533%2C193.714%2C144.533%2C193.714c64.417-69.391%2C147.02-206.308%2C147.02-206.308s31.351-63.531%2C31.351-101.044%20C434.877%2C92.736%2C354.921%2C12.781%2C256.292%2C12.781z%20M256.292%2C297.159c-66.021%2C0-119.546-53.523-119.546-119.546%20S190.271%2C58.067%2C256.292%2C58.067s119.546%2C53.522%2C119.546%2C119.546S322.313%2C297.159%2C256.292%2C297.159z%22%2F%3E%0A%3Ccircle%20fill%3D%22'
    //     + colours[1] + '%22%20cx%3D%22256.292%22%20cy%3D%22177.613%22%20r%3D%2272.107%22%2F%3E%0A%3C%2Fg%3E%0A%3C%2Fsvg%3E';

    // return ("data:image/svg+xml," + svg).replace(/#/g,"%23");

    return ("data:image/svg+xml," + svg)
    .replace(/\{LETTER\}/g, letter)
    .replace(/\{COLOR\}/g, color);

};