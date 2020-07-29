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

        return `SELECT 
    	ROUND(sum(b.pop__11)) as _pop__11, 
    	ROUND(sum(b.pop__12)) as _pop__12,
    	ROUND(sum(b.pop__13)) as _pop__13,
    	ROUND(sum(b.pop__14)) as _pop__14,
    	ROUND(sum(b.pop__15)) as _pop__15,
    	ROUND(sum(b.pop__16)) as _pop__16,     
    	ROUND(sum(b.pop__17)) as _pop__17,
    	ROUND(sum(b.pop__18)) as _pop__18
    	FROM ${table(_)} a, ${hex(_)} b 
    	WHERE a.${qID(_)} = ${id(_)} 
    	AND ST_INTERSECTS(a.geom_4326, b.geom_p_4326);`;
    }
}
