module.exports = function Comparison(_this){

    _this.comparison = {};
    _this.comparison.fromGeoJSON = function(feature){
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'q_grid_info');
        xhr.setRequestHeader("Content-Type","application/json");
        xhr.onload = function(){
            if(this.status === 200) console.log(this.response);
        }
        xhr.send(JSON.stringify({
            infoj: _this.countries[_this.country].grid.infoj,
            database: _this.countries[_this.country].grid.database,
            geometry: feature.geometry
        }));
    }

}