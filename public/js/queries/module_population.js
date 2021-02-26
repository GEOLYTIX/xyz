module.exports = {
    render: _ => {

    	function table(_){

    		if(!_.layer.tables) return _.layer.table;

    		let table = _.layer.tables[_.z];

    		if(!table) {

    			let zoomKeys = Object.keys(_.layer.tables);

    			let z = _.z;

    			if(z <= Math.min(...zoomKeys)) z = Math.min(...zoomKeys);

    		    if(z >= Math.max(...zoomKeys)) z = Math.max(...zoomKeys);

    		    table = _.layer.tables[z];

    		}

    		return table;
    	}

    	function qID(_){
    		return _.layer.qID;
    	}

    	function id(_){
    		return _.id;
    	}

    	function hex(_){

    		const hex = {
    			"8": "geodata.uk_glx_geodata_hex_16k",
    			"9": "geodata.uk_glx_geodata_hex_8k",
    			"10": "geodata.uk_glx_geodata_hex_4k",
    			"11": "geodata.uk_glx_geodata_hex_2k",
    			"12": "geodata.uk_glx_geodata_hex_1k",
    			"13": "geodata.uk_glx_geodata_hex_1k"
    		}

    		let zoomKeys = Object.keys(hex);

    		let z = _.z;

    		if(!hex[z]) {
    			
    			if(z <= Math.min(...zoomKeys)) z = Math.min(...zoomKeys);

    		    if(z >= Math.max(...zoomKeys)) z = Math.max(...zoomKeys);
    		
    		}

    		return hex[z];
    	}

      return `SELECT ARRAY[json_build_object('data', ARRAY [
        ROUND(sum(b.pop__11)),
        ROUND(sum(b.pop__12)),
        ROUND(sum(b.pop__13)),
        ROUND(sum(b.pop__14)),
        ROUND(sum(b.pop__15)),
        ROUND(sum(b.pop__16)),
        ROUND(sum(b.pop__17)),
        ROUND(sum(b.pop__18))
        ],
        'backgroundColor', ARRAY [
        '#b2dfdb',
        '#80cbc4',
        '#4db6ac',
        '#26a69a',
        '#009688',
        '#00897b',
        '#00796b',
        '#00695c']
        )] AS datasets,
        ARRAY[
        '2011',
        '2012',
        '2013',
        '2014',
        '2015',
        '2016',
        '2017',
        '2018'] AS labels 
        FROM ${table(_)} a, ${hex(_)} b 
        WHERE a.${qID(_)} = ${id(_)} 
        AND ST_INTERSECTS(a.geom_4326_5m, b.geom_p_4326);`
    }
}
