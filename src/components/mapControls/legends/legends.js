export const legends = {
    data() {
        return {
          //activeLayers: []
        }
    },
    methods: {

      getLegendSource: function(layer){
          var url = process.env.VUE_APP_GEOSERVER_URL + 'wms?'

          var params = 'service=WMS' +
          '&REQUEST=GetLegendGraphic' +
          '&VERSION=1.1.1' + 
          '&FORMAT=image/png' + 
          '&WIDTH=100' +
          '&HEIGHT=20' + 
          '&LAYER=' +  layer.provider.geoserverdata.workspace + ':' + layer.provider.geoserverdata.filename +
          '&LAYER_WORK=' + layer.provider.geoserverdata.workspace

          return url+params
      }
    }
  }