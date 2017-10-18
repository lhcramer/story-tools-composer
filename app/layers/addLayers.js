"use strict";

function addLayers(
  $log,
  $http,
  $sce,
  limitToFilter,
  MapManager,
  searchSvc,
  addLayerSvc,
  appConfig
) {
  return {
    restrict: "E",
    scope: {
      map: "="
    },
    templateUrl: "./app/layers/templates/add-layers.html",
    link: function(scope, el, atts) {
      var nameIndex;
      var names;
      scope.server = {
        active: appConfig.servers[0]
      };
      scope.servers = appConfig.servers;
      scope.results = function(layerName) {
        return searchSvc
          .getSearchBarResultsIndex(layerName)
          .then(function(res) {
            nameIndex = res;
            names = addLayerSvc.compileLayerNamesFromSearchIndex(res);
            return limitToFilter(names, 15);
          });
      };
      scope.addLayer = function() {
        scope.loading = true;
        console.log("ADD LAYER");
        var name = addLayerSvc.getNameFromIndex(scope.layerName, nameIndex);
        var settings = {
          asVector: scope.asVector,
          allowZoom: scope.allowZoom,
          allowPan: scope.allowPan
        };
        MapManager.addLayer(name, settings, scope.server.active)
          .then(function() {
            scope.$parent.status.open = false;
          }, addLayerSvc.handleAddLayerError)
          .finally(function() {
            scope.loading = false;
          });
        scope.layerName = null;
      };
    }
  };
}

module.exports = addLayers;
