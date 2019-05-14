/* ***************************************************
   ssBaseMap
*/

var ssMaps = {};

function ssBaseMap(opts) {
  this.smallMapLimit = 275;
  this.oColor = new ss.parseColor();
  this.removeEditor = null;
  this.editable = false;
  this.itemList = '';
  this.elementID = "map";
  this.center = {x:42, y:-71};
  this.zoom = 6;
  this.icons = Object();
  jQuery.extend(this, opts);

  ssMaps[this.elementID] = this;

  this.zoom = this.adjustZoom(this.zoom);

  this.mapItems = new ssMapItems(this);
};

ssBaseMap.prototype.getLatLongs = function(xyArray) {
  // Return an array of lat/long objects created
  // from an array of coordinates stored in objects
  // with "x" and "y" properties
  var latLngs = [];

  var nPoints = xyArray.length;
  for (var i = 0; i < nPoints; i++) {
    latLngs.push(this.getLatLong(xyArray[i]));
  };
  return latLngs;
};

ssBaseMap.prototype.getColor = function(sColor) {
  this.oColor.parse(sColor);
  return this.oColor.toHex();
};

ssBaseMap.prototype.imageUrl = function(imageName) {
  // Returns imageName for now; in the future, it may
  // return a relatve path.
  return 'mimages/' + imageName;
};

ssBaseMap.prototype.iconFileName = function(iconName) {
  iconName = iconName.toLowerCase().replace(/ /g, '-');
  return 'mapicon-'+iconName+'.png';
};

ssBaseMap.prototype.adjustZoom = function(zoom) {
  return zoom;
};

ssBaseMap.prototype.itemClick = function(itemKey) {
  this.mapItems.itemClick(itemKey);
};

ssBaseMap.prototype.itemDblClick = function(itemKey) {
  this.mapItems.itemDblClick(itemKey);
};

ssBaseMap.prototype.moveTo = function(mapItem, latLong) {
};

ssBaseMap.prototype.getShapeCenter = function(mapItem) {
  var nPoints = mapItem.points.length;
  var totalX = 0.0, totalY = 0.0;
  for (var iPoint=0; iPoint<nPoints; iPoint++) {
// ToDo:Confirm that we need parseFloat here (already a float?)
    totalX += parseFloat(mapItem.points[iPoint].x);
    totalY += parseFloat(mapItem.points[iPoint].y);
  };
  return this.getLatLong( { x:totalX/nPoints, y:totalY/nPoints } );
};

/* ***************************************************
   ssBingMap
*/

ss.bingMaps = [];
function addBingMaps() {
  var maps = ss.bingMaps.length;
  for (var i = 0; i < maps; i++) {
    ss.bingMaps[i]();
  };
};

function ssBingMap(opts) {
  ssBingMap.baseConstructor.call(this, opts);
  var self = this;

  var mapTypes = {
    Road: {typeId: Microsoft.Maps.MapTypeId.road, labels:Microsoft.Maps.LabelOverlay.visible},
    Aerial: {typeId: Microsoft.Maps.MapTypeId.aerial, labels:Microsoft.Maps.LabelOverlay.hidden},
    Hybrid: {typeId: Microsoft.Maps.MapTypeId.aerial, labels:Microsoft.Maps.LabelOverlay.visible},
    Terrain: {typeId: Microsoft.Maps.MapTypeId.road, labels:Microsoft.Maps.LabelOverlay.visible}
  };

  var mapElement = document.getElementById(this.elementID);

  var mapOptions = {
    center: this.getLatLong(this.center),
    credentials: opts.key,
    enableClickableLogo: false,
    mapTypeId: mapTypes[this.mapType].typeId,
    showLocateMeButton: false,
    showMapLabel: mapTypes[this.mapType].labels,
    zoom: this.zoom
  };
  this.map = new Microsoft.Maps.Map(mapElement, mapOptions);

  // Bing v8 navigation buttons use 75px on each side, so
  // center infobox with 75px margin on left and right
  this.infoWindowWidth = Math.min(Math.floor(mapElement.offsetWidth - 150), 400);
  this.infoWindow = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(0,0), {visible:false});
  this.infoWindow.setMap(this.map);

/*
  // Manage mouse cursor
  Microsoft.Maps.Events.addHandler(this.map, "mousemove", function (e) {
    var mapElem = self.map.getRootElement();
    if (e.targetType === 'map') {
      // Mouse is over Map
      mapElem.style.cursor = 'url("http://ecn.dev.virtualearth.net/mapcontrol/v7.0/cursors/grab.cur"),move';
    } else {
      // Mouse is over Pushpin, Polyline, Polygon
      mapElem.style.cursor = 'pointer';
    };
  });
*/
};

// ssBingMap is subclass of ssBaseMap
ss.extend(ssBaseMap, ssBingMap);

ssBingMap.prototype.getLatLong = function(xyObject) {
  // Return a Location object from coordinates in
  // an object with "y" (lat) and "x" (long) properties
  return new Microsoft.Maps.Location(parseFloat(xyObject.y), parseFloat(xyObject.x));
};

ss.BingMapsClose = function(mapID) {
  var ssMap = ssMaps[mapID];
  if (ssMap) {
    ssMap.infoWindow.setOptions({visible:false});
    return false;
  };
};

ssBingMap.prototype.openItemWindow = function(latLng, mapItem) {
  var self = this, loc, off, sStyle = '';

  // HTML for the custom infobox
  var sInfoBoxTemplate = '<div class="bing-infobox" style="width:{width}px">' +
      '<button class="icon iconclose bing-infobox-close" onclick="ss.BingMapsClose({id})"></button>' +
      '<div class="bing-infobox-content">{content}</div></div>' +
      '<div class="bing-infobox-arrow"></div>';
  sInfoBoxTemplate = sInfoBoxTemplate.replace('{id}',  "'" + this.elementID + "'");
  sInfoBoxTemplate = sInfoBoxTemplate.replace('{width}', this.infoWindowWidth);

  var sContent = '<div class="bing-infobox-title">' + mapItem.name + '</div>';
  sContent += '<div class="bing-infobox-description">' + mapItem.getDescription() + '</div>';
  sContent = sInfoBoxTemplate.replace('{content}', sContent);

  this.moveTo(mapItem, latLng);

  if (mapItem.type=='Marker') {
    loc = mapItem.getCenter();
    off = new Microsoft.Maps.Point(-this.infoWindowWidth / 2, 16);
  } else {
    loc = latLng;
    off = new Microsoft.Maps.Point(-this.infoWindowWidth / 2, 0);
  };
  this.infoWindow.setLocation(loc);
  this.infoWindow.setOptions({
    offset: off,
    htmlContent: sContent,
    visible: true
  });
};

ssBingMap.prototype.closeItemWindow = function() {
  this.infoWindow.setOptions({visible:false});
};

ssBingMap.prototype.getBingColor = function(sColor, nOpacity) {
  this.oColor.parse(sColor);
  return new Microsoft.Maps.Color(nOpacity*255, this.oColor.r, this.oColor.g,
      this.oColor.b);
};

ssBingMap.prototype.moveTo = function(mapItem, latLong) {
  if (latLong) {
    this.map.setView({center:latLong});
  } else {
    this.map.setView({center:mapItem.getCenter()});
  };
};

function bingItemClickHandler(e) {
	var mapItem = e.target.ssMapItem_;
	if (mapItem) {
	  var point = new Microsoft.Maps.Point(e.getX(), e.getY());
	  var latLng = mapItem.map.tryPixelToLocation(point);
	  mapItem.click();
	  return false;
	};
};

ssBingMap.prototype.newMarker = function(mapItem) {
  var latLng = this.getLatLong(mapItem.points[0]);
  var opts = {};

  if (mapItem.iconName != 'standard') {
    opts.icon = this.imageUrl(this.iconFileName(mapItem.iconName));
  };

  var theShape = new Microsoft.Maps.Pushpin(latLng, opts);
  this.map.entities.push(theShape);
  Microsoft.Maps.Events.addHandler(theShape, 'click', bingItemClickHandler);
  return theShape;
};

ssBingMap.prototype.newPolygon = function(mapItem) {
  var latLngs = this.getLatLongs(mapItem.points);
  var opts = {};

  opts.fillColor = this.getBingColor(mapItem.fillColor, mapItem.fillOpacity);
  opts.strokeColor = this.getBingColor(mapItem.lineColor, mapItem.lineOpacity);
  opts.strokeThickness = mapItem.lineWidth;

  var theShape = new Microsoft.Maps.Polygon(latLngs, opts);
  this.map.entities.push(theShape);
  Microsoft.Maps.Events.addHandler(theShape, 'click', bingItemClickHandler);
  return theShape;
};

ssBingMap.prototype.newPolyline = function(mapItem) {
  var latLngs = this.getLatLongs(mapItem.points);
  var opts = {};

  opts.strokeColor = this.getBingColor(mapItem.lineColor, mapItem.lineOpacity);
  opts.strokeThickness = mapItem.lineWidth;

  var theShape = new Microsoft.Maps.Polyline(latLngs, opts);
  this.map.entities.push(theShape);
  Microsoft.Maps.Events.addHandler(theShape, 'click', bingItemClickHandler);
  return theShape;
};

/* ***************************************************
   ssGoogleMap, a subclass of ssBaseMap
*/

function ssGoogleMap(opts) {
  ssGoogleMap.baseConstructor.call(this, opts);

  // Map Editor
  this.editable = ss.isMapEditor();
  this.drawingManager = null;
  this.selectedItem = null;

  var mapElement = document.getElementById(this.elementID);
  $(this.elementID).css('overflow', 'hidden');

  var mapTypes = {
    Road: google.maps.MapTypeId.ROADMAP,
    Aerial: google.maps.MapTypeId.SATELLITE,
    Hybrid: google.maps.MapTypeId.HYBRID,
    Terrain: google.maps.MapTypeId.TERRAIN
  };

  var isSmall = (mapElement.offsetWidth<this.smallMapLimit ||
      mapElement.offsetHeight<this.smallMapLimit);

  var mapOpts = {
    zoom: this.zoom,
    center: this.getLatLong(this.center),
    mapTypeId: mapTypes[this.mapType],
    mapTypeControl: true,
    zoomControl: true,
    streetViewControl: true,
    scaleControl: !isSmall,
    rotateControl: !isSmall
  };

  if (this.editable) {
    mapOpts.zoomControlOptions = { style: google.maps.ZoomControlStyle.SMALL };
    mapOpts.mapTypeControlOptions = { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU };

  } else if (isSmall) {
    mapOpts.zoomControlOptions = { style: google.maps.ZoomControlStyle.SMALL };
    mapOpts.streetViewControl = false;
  };

  this.map = new google.maps.Map(mapElement, mapOpts);

  this.infoWindow = new google.maps.InfoWindow({
    position: this.getLatLong(this.center),   // never used; reset later
    maxWidth: Math.max(200, Math.min(400, Math.floor(mapElement.offsetWidth*.8))),
    content: ""
  });

  if (this.editable) {
    this.addDrawingControls();
  };
};

// ssGoogleMap is subclass of ssBaseMap
ss.extend(ssBaseMap, ssGoogleMap);

ss.OverlayType = {};
ss.OverlayType.MARKER = "marker";
ss.OverlayType.POLYLINE = "polyline";
ss.OverlayType.POLYGON = "polygon";

ssGoogleMap.prototype.getLatLong = function(xyObject) {
  // Return a google.maps.LatLng object from coordinates in
  // an object with "x" and "y" properties

// ToDo:Confirm that we need parseFloat here (already a float?)
  return new google.maps.LatLng(parseFloat(xyObject.y), parseFloat(xyObject.x));
};

ssGoogleMap.prototype.openItemWindow = function(latLng, mapItem) {
  this.infoWindow.setPosition(latLng);
  this.infoWindow.setContent(mapItem.name+mapItem.getDescription());
  this.infoWindow.open(this.map);
  this.map.panTo(latLng);
};

ssGoogleMap.prototype.moveTo = function(mapItem, latLong) {
  if (latLong) {
    this.map.panTo(latLong);
  } else {
    var shapeCenter = mapItem.getCenter();
    this.map.panTo(shapeCenter);
  };
};

ssGoogleMap.prototype.makeIcon = function(name, shadow, shadowWidth, shadowHeight) {
  // Make icon
  var icon = new google.maps.MarkerImage(
      this.imageUrl(this.iconFileName(name)),
      new google.maps.Size(32, 32),
      new google.maps.Point(0, 0),
      new google.maps.Point(16, 31));

  // Make shadow
  shadowWidth = shadowWidth || 40;
  shadowHeight = shadowHeight || 32;
  if (!shadow) {
    if (name.indexOf('small') != -1) {
      shadow = 'small-shadow';
    } else {
      shadow = 'full-shadow';
    };
  };
  var shadow = new google.maps.MarkerImage(
      this.imageUrl(this.iconFileName(shadow)),
      new google.maps.Size(shadowWidth, shadowHeight),
      new google.maps.Point(0, 0),
      new google.maps.Point(16, 31));

  return { 'icon': icon, 'shadow': shadow };
};

ssGoogleMap.prototype.getMarkerIcon = function(iconName) {
  // Make icon if we don't have it already
  var sIconName = iconName.toLowerCase();
  if (!this.icons[sIconName]) {
    this.icons[sIconName] = this.makeIcon(sIconName);
  };
  return this.icons[sIconName];
};

ssGoogleMap.prototype.newMarker = function(mapItem, shape) {
  var theShape;

  if (!shape) {
    theShape = new google.maps.Marker({
      draggable: this.editable,
      position: this.getLatLong(mapItem.points[0]),
      title: mapItem.name,
      icon: this.getMarkerIcon(mapItem.iconName).icon,
      shadow: this.getMarkerIcon(mapItem.iconName).shadow,
      map: this.map
    });
    theShape.type = ss.OverlayType.MARKER;
  } else {
    theShape = shape;
  };

  google.maps.event.addListener(theShape, 'click', function(e) {
    mapItem.click(e.latLng);
  });

  return theShape;
};

ssGoogleMap.prototype.newPolygon = function(mapItem, shape) {
  var theShape;

  if (!shape) {
    var latLngs = this.getLatLongs(mapItem.points);
    theShape = new google.maps.Polygon({
      paths: latLngs,
      strokeColor: this.getColor(mapItem.lineColor),
      strokeOpacity: mapItem.lineOpacity,
      strokeWeight: mapItem.lineWidth,
      fillColor: this.getColor(mapItem.fillColor),
      fillOpacity: mapItem.fillOpacity,
      map: this.map
    });
    theShape.type = ss.OverlayType.POLYGON;
  } else {
    theShape = shape;
  };

  google.maps.event.addListener(theShape, 'click', function(e) {
    if (this.getEditable()) {
      if (e.vertex != null && this.getPath().getLength() > 3) {
          this.getPath().removeAt(e.vertex);
      };
    } else {
      mapItem.click(e.latLng);
    };
  });

  return theShape;
};

ssGoogleMap.prototype.newPolyline = function(mapItem, shape) {
  var theShape;

  if (!shape) {
    var latLngs = this.getLatLongs(mapItem.points);
    theShape = new google.maps.Polyline({
      path: latLngs,
      strokeColor: this.getColor(mapItem.lineColor),
      strokeOpacity: mapItem.lineOpacity,
      strokeWeight: mapItem.lineWidth,
      map: this.map
    });
    theShape.type = ss.OverlayType.POLYLINE;
  } else {
    theShape = shape;
  };

  google.maps.event.addListener(theShape, 'click', function(e) {
    if (this.getEditable()) {
      if (e.vertex != null && this.getPath().getLength() > 3) {
          this.getPath().removeAt(e.vertex);
      };
    } else {
      mapItem.click(e.latLng);
    };
  });

  return theShape;
};

/* ***************************************************
   ssMapItems
*/

function ssMapItems(ssMap) {
  this.ssMap = ssMap;
  this.items = Object();
  this.nextKey = 1;
  this.length = 0;
};

ssMapItems.prototype.add = function(mapItem) {
  /*
    addItem adds an item to the list of items.
  */
  mapItem.key = this.nextKey++;
  this.items[mapItem.key] = mapItem;
  this.length++;
  return mapItem;
};

ssMapItems.prototype.addMarker = function(opts, shape) {
  return this.add(new ssMapItemMarker(opts, this, shape));
};

ssMapItems.prototype.addPolygon = function(opts, shape) {
  return this.add(new ssMapItemPolygon(opts, this, shape));
};

ssMapItems.prototype.addPolyline = function(opts, shape) {
  return this.add(new ssMapItemPolyline(opts, this, shape));
};

ssMapItems.prototype.itemClick = function(itemKey) {
  var mapItem = this.items[itemKey];
  mapItem.click();
};

ssMapItems.prototype.itemDblClick = function(itemKey) {
  var mapItem = this.items[itemKey];
  mapItem.edit();
};


ssMapItems.prototype.refreshList = function(elementID) {
  /*
    refreshList() adds an LI element to a list
    for each qualifying MapItem; use it to
    construct a sidebar
  */
  var sElementID = '';

  if (arguments.length>0) {
    sElementID = elementID;
    this.ssMap.itemList = sElementID;
  } else {
    sElementID = this.ssMap.itemList;
  };

  if (sElementID != '') {
    var mapName = "'"+this.ssMap.elementID+"'";
    var sContents = '';
    var sID = '';
    var sHandle = '';
    if (this.ssMap.editable) {
      sHandle = '<div class="move-handle"></div>';
    };

    for (var item in this.items) {
      var mapItem = this.items[item];
      if (mapItem.inItemList || this.ssMap.editable) {
        if (this.ssMap.editable) {
          sID = ' id="item-'+mapItem.key+'"';
          sID += ' ondblclick="ssMaps['+mapName+'].itemDblClick('+mapItem.key+')"';
        };
        sContents += '<li'+sID+' onclick="ssMaps['+mapName+'].itemClick('+mapItem.key+')">';
        sContents += sHandle+mapItem.getListContent();
        sContents += '</li>';
      };
    };
    $(sElementID).html(sContents);
  };
};

/* ***************************************************
   ssMapItem
*/

function ssMapItem(opts, list) {
  /*
    ssMapItem constructor; sets the basic
    properties for all map items and then
    copies the "opts" properties into the item.
  */
  this.name = '';
  this.fillColor = '#ff0';
  this.fillOpacity = 0.2;
  this.icon = '';
  this.lineColor = '#fd645c';
  this.lineOpacity = 0.7;
  this.lineWidth = 3;
  this.points = [];
  this.shape = null;
  this.text = '';
  this.type = '';
  this.hasIcon = false;
  this.iconName = 'standard';
  this.hasLine = false;
  this.hasFill = false;
  this.inItemList = true;
  this.showCoordinates = true;

  jQuery.extend(this, opts);

  // Old items have points stored as strings
  // Convert to floats
  for (var iPoint=0; iPoint<this.points.length; iPoint++) {
    this.points[iPoint] = {
      x:parseFloat(this.points[iPoint].x),
      y:parseFloat(this.points[iPoint].y)
    };
  };

  if (list) {
    this.ssMap = list.ssMap;
    this.map = this.ssMap.map;
  };
};

ssMapItem.prototype.addEditingHandler = function() {};

ssMapItem.prototype.getCenter = function() {
  if (this.points.length==1) {
    // Item with only one point
    return (this.ssMap.getLatLong(this.points[0]));
  } else {
    // Item with multiple points
    return (this.ssMap.getShapeCenter(this));
  };
};

ssMapItem.prototype.click = function(latLng) {
  /*
    click handler used when infobox
    is opened via the mouse
  */
  if (this.name != '') {
    this.ssMap.openItemWindow(latLng ? latLng : this.getCenter(), this);
  };
};

ssMapItem.prototype.getDescription = function() {
  var sText = this.text;
  if (sText != '') {
    sText = '<div class="smib">'+sText+'</div>';
  };
  if (this.points.length==1 && this.showCoordinates) {
    sText += '<div class="smic">'+this.points[0].y.toFixed(6)+','+this.points[0].x.toFixed(6)+'</div>';
  };
  return sText;
};

ssMapItem.prototype.getListContent = function() {
  if (this.name != '') {
    return (this.name);
  } else {
    return (this.type+' ('+this.key+')');
  };
};

ssMapItem.prototype.moveTo = function(latLong) {
  // Delegate moveTo function to service-specific class
  return this.ssMap.moveTo(this, latLong);
};

/* ***************************************************
   ssMapItemMarker, subclass of ssMapItem
*/

function ssMapItemMarker(opts, list, shape) {
  ssMapItemMarker.baseConstructor.call(this, opts, list);
  this.type = 'Marker';
  this.hasIcon = true;
  this.shape = this.ssMap.newMarker(this, shape);
  this.shape.ssMapItem_ = this;
  if (this.ssMap.editable) this.addEditingHandler();
};
ss.extend(ssMapItem, ssMapItemMarker);

/* ***************************************************
   ssMapItemPolygon, subclass of ssMapItem
*/

function ssMapItemPolygon(opts, list, shape) {
  ssMapItemPolygon.baseConstructor.call(this, opts, list);
  this.type = 'Polygon';
  this.hasLine = true;
  this.hasFill = true;
  this.shape = this.ssMap.newPolygon(this, shape);
  this.shape.ssMapItem_ = this;
  if (this.ssMap.editable) this.addEditingHandler();
};
ss.extend(ssMapItem, ssMapItemPolygon);

/* ***************************************************
   ssMapItemPolyline, subclass of ssMapItem
*/

function ssMapItemPolyline(opts, list, shape) {
  ssMapItemPolyline.baseConstructor.call(this, opts, list);
  this.type = 'Polyline';
  this.hasLine = true;
  this.shape = this.ssMap.newPolyline(this, shape);
  this.shape.ssMapItem_ = this;
  if (this.ssMap.editable) this.addEditingHandler();
};
ss.extend(ssMapItem, ssMapItemPolyline);