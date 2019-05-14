// Second Site Search, Copyright (c) 2012-2013 John Cardinal (John@JohnCardinal.com)
/*
Array.prototype.swap = function(x,y) {
  var b = this[x];
  this[x] = this[y];
  this[y] = b;
  return this;
};
*/
var oSearch;    // Main instance of search facility
var ss_search_data = new SSSearchData();

// Catch cases where page is reloaded on back button and repeat search
if(!(window.onpageshow || window.onpageshow === null)){
  $(window).on('load', pageshow);
};
$(window).on('pageshow', pageshow);

function pageshow(event) {
  var bPersisted = (event.persisted ? event.persisted : false);
  var nPage = parseInt($('#page').val(),10);
  if ((nPage>0) && !bPersisted) {
    oSearch.doSearch(nPage);
  };
  return false;
};

// SearchData method used by Search only
// Other methods are in scripts.js
SSSearchData.prototype.getPersonSummary = function(person) {
  // Make the summary that appears beneath a search result
  function addSummaryText(current, prefix, add, suffix) {
    if (add !== '') {
      if (current !== '') {
        return current + ' ' + prefix + add + suffix;
      } else {
        return prefix + add + suffix;
      };
    } else {
      return '';
    };
  };

  var sOut = '';

  if (person.u[3]) sOut = addSummaryText(sOut, this.oOptions.stringBorn, this.baseYear-person.u[3], '');
  if (person.u[4]) sOut = addSummaryText(sOut, this.oOptions.stringDied, this.baseYear-person.u[4], '');
  if (person.f) {
    sOut = addSummaryText(sOut, this.oOptions.stringFather, this.getPersonLink(this.people[person.f]), '');
  };
  if (person.m) {
    sOut = addSummaryText(sOut, this.oOptions.stringMother, this.getPersonLink(this.people[person.m]), '');
  };

  for (var iName = 1, nNames=person.n.length; iName < nNames; iName++) {
    if (sOut) sOut += '<br/>';
    sOut = addSummaryText(sOut, this.oOptions.stringNameVar, this.getPersonName(person, iName), '');
  };

  if (person.s) {
    // Show spouses
    for (var iSpouse = 0, nSpouses=person.s.length; iSpouse < nSpouses; iSpouse++) {
      if (sOut) sOut += '<br/>';
      sOut = addSummaryText(sOut, this.oOptions.stringSpouse, this.getPersonLink(this.people[person.s[iSpouse]]), '');
    };
  };

  if (person.r) {
    // Show included people linked to excluded subject
    for (var iRef = 0, nRefs=person.r.length; iRef < nRefs; iRef++) {
      if (sOut) sOut += '<br/>';
      sOut = addSummaryText(sOut, this.oOptions.stringReference, this.getPersonLink(this.people[person.r[iRef]]), '');
    };
  };

  if (this.oOptions.showPlaces && person.p){
    // Show all places
    var places = [];
    for (var iPlace = 0, nPlaces=person.p.length; iPlace < nPlaces; iPlace++) {
      places.push(ss_search_data.places[person.p[iPlace]]);
    };
    places.sort();
    for (iPlace = 0; iPlace < nPlaces; iPlace++) {
      if (sOut) sOut += '<br/>';
      sOut = addSummaryText(sOut, this.oOptions.stringPlace, places[iPlace], '');
    };

  } else if (person.hp !== -1) {
    // Show place that matched search
    if (sOut) sOut += '<br/>';
    sOut = addSummaryText(sOut, this.oOptions.stringPlace, ss_search_data.places[person.hp], '');
  };

  if (sOut !== '') sOut = ' <span class="summary">' + sOut + '</span>';

  return sOut;
};

function SSSearchFields(oOptions) {
  // Setup the search fields which control comparison operations
  this.oOptions = oOptions;
  this.yearFilters = 0;
  this.nameFilters = 0;
  this.placeFilters = 0;

  // Add definitions of search fields
  this.addField('s', 'ss', oOptions.surnameWeight, {'type':'name'});
  this.addField('o', 'sg', oOptions.otherWeight, {'type':'name'});
  this.addField('b', 'sby', oOptions.yearWeight, {'type':'year','index':3,'circa':$('#sbc').val()});
  this.addField('d', 'sdy', oOptions.yearWeight, {'type':'year','index':4,'circa':$('#sdc').val()});
  if (oOptions.searchPlaces) {
    this.addField('p', 'sp', oOptions.placeWeight, {'type':'place'});
  };
  if (oOptions.searchSpouses) {
    this.addField('s', 'sss', oOptions.spouseSurnameWeight, {'type':'name','person':'s'});
    this.addField('o', 'sgs', oOptions.spouseOtherWeight, {'type':'name','person':'s'});
  };
  if (oOptions.searchParents) {
    this.addField('s', 'ssf', oOptions.parentSurnameWeight, {'type':'name','person':'f'});
    this.addField('o', 'sgf', oOptions.parentOtherWeight, {'type':'name', 'person':'f'});
    this.addField('s', 'ssm', oOptions.parentSurnameWeight, {'type':'name','person':'m'});
    this.addField('o', 'sgm', oOptions.parentOtherWeight, {'type':'name', 'person':'m'});
  };
};

// Make SSSearchFields work like an Array
SSSearchFields.prototype.length = 0;
SSSearchFields.prototype.push = Array.prototype.push;
SSSearchFields.prototype.pop = Array.prototype.pop;

SSSearchFields.prototype.addField = function(name, id, weight, fieldOptions) {
  var value = $('#' + id).val();
  oStorage.setItem('search-field-'+id, value);
  if (value !== '') {
    var sTarget = value;
    var oSettings = {'type':'text','circa':0,'person':''};
    $.extend(oSettings, fieldOptions);

    try {
      if (oSettings.type == 'name') {
        sTarget = this.getAdjustedTarget(sTarget, '\\b', '\\b', oSettings.type);
        var oNameRe = new RegExp(sTarget, 'i');
        this.push({'type':oSettings.type,'name':name,'weight':weight,'re':oNameRe,'person':oSettings.person});
        this.nameFilters++;

      } else if (oSettings.type == 'year') {
        oSettings.circa = parseInt(oSettings.circa,10);
        value = parseInt(value,10);
        this.push({'type':'year','index':oSettings.index,'weight':weight,'value':value,'low':value-oSettings.circa,'high':value+oSettings.circa});
        this.yearFilters++;

      } else if (oSettings.type == 'place') {
        var aParts = value.split(';');
        for (var iPart = 0, nParts = aParts.length; iPart < nParts; iPart++) {
          aParts[iPart] = aParts[iPart].trim();
          if (aParts[iPart].length > 0) {
            sTarget = this.getAdjustedTarget(aParts[iPart], '\\b', '\\b', oSettings.type);
            var oPlaceRe = new RegExp(sTarget, 'i');
            this.push({'type':oSettings.type,'name':name,'weight':weight,'re':oPlaceRe});
            this.placeFilters++;
          };
        };
      };
    } catch(e) {
      // Do nothing for now, maybe forever
    };
  };
};

SSSearchFields.prototype.getAdjustedTarget = function(target, prefix, suffix, type) {
  // Modify the target if we are using the basic search mode
  var sTarget = target;
  if (this.oOptions.basicSearch) {
    // Basic mode accepts only * and ? as wildcard characters;
    // disable RegEx characters and substitute * and ?
    sTarget = sTarget.replace(/[-[\]{}()+.\\^$|#]/g, "\\$&");
    sTarget = sTarget.replace(/\*/g, '.*');
    sTarget = sTarget.replace(/\\\\\.\*/g, '\\*');

    sTarget = sTarget.replace(/\?/g, '.');
    sTarget = sTarget.replace(/\\\\\./g, '\\?');

    sTarget = prefix + sTarget + suffix;
  };

  if (type === 'place') {
    sTarget = sTarget.replace(/,[ ]*/g, '.*');
  };
  return sTarget;
};

SSSearchFields.prototype.getMaxWeight = function() {
  // Calculate the maximum weight given the current
  // set of field values
  var sum = 0;
  var bPlace = false;

  for (var iField = 0, nFields = this.length; iField < nFields; iField++) {
    var oField = this[iField];
    if (oField.type == 'place') {
      if (bPlace) {
        sum += this.oOptions.placePartWeight;
      } else {
        sum += oField.weight;
      };
      bPlace = true;
    } else {
      sum += oField.weight;
    };
  };
  return sum;
};

function SSSearch(options) {
  // Initialize the search facility (options, HTML, event handlers)
  // Default options
  var oDefaults = {
    stringNameVar: 'v:',
    stringBorn: 'b:',
    stringDied: 'd:',
    stringFather: 'father:',
    stringMother: 'mother:',
    stringSpouse: 'spouse:',
    stringReference: 'see:',
    stringPlace: 'place:',
    stringPrevious: 'Previous',
    stringNext: 'Next',
    stringResults: 'Results {0} to {1} of {2}',
    stringNoMatches: 'No matches',
    stringNotClose: 'The following results are not close matches, but may be of interest.',
    stringHelpText: '',
    filetype: 'htm',
    defaultSearch: 'basic',
    basicSearch: true,
    showMethod: true,
    searchPlaces: true,
    searchSpouses: true,
    searchParents: true,
    showPlaces: false,
    surnameWeight: 200,
    otherWeight: 100,
    yearWeight: 90,
    placePartWeight: 10,
    placeWeight: 90,
    circaWeight: 2,
    nonPrimaryWeight: -20,
    spouseSurnameWeight: 100,
    spouseOtherWeight: 100,
    parentSurnameWeight: 100,
    parentOtherWeight: 100,
    itemsPerPage: 50,
    maxPages: 10,
    thresholdFactor: .80
  };
  this.baseYear = ss_search_data.baseYear;
  this.nComparisons = 0;
  this.nMatches = 0;
  this.nElapsed = 0;
  this.oOptions = $.extend({}, oDefaults, options);
  this.oOptions.showPlaces = this.oOptions.searchPlaces && this.oOptions.showPlaces;
  $('div.search-set-method input').prop('checked', !(this.oOptions.defaultSearch=='basic'));
  $('div.search-set-method').toggle(this.oOptions.showMethod);

  if (this.oOptions.searchPlaces) $('.search-set-show-place').show();
  if (this.oOptions.searchSpouses) $('.search-set-show-spouse').show();
  if (this.oOptions.searchParents) $('.search-set-show-parents').show();
  $('.search-set').show();

  this.getFormValues();

  var that = this;
  if (this.oOptions.stringHelpText) {
    $('div.search-set').prepend('<button class="icon iconhelp search-set-help"></button>');
    $('div.search-set button.search-set-help').click(function(e) {
      e.preventDefault();
      ss.showPopup(that.oOptions.stringHelpText + '<button class="popup-close search-set-close-help">Close</button>', 'search-set-help');
    });
  };

  $('#ssSearch_submit').click(function(e) {
    e.preventDefault();
    that.doSearch(1);
  });

  $("div.search-set form input").keypress(function (e) {
    if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
      var deviceAgent = navigator.userAgent.toLowerCase();
      if (deviceAgent.match(/(iphone|ipod|ipad)/)) $(this).blur();  // Hide iOS keyboard
      $('#ssSearch_submit').click();
      return false;
    } else {
      return true;
    }
  });

  $('.search-set-ovum').click(function(e) {
    alert(that.getStats());
  });
};

SSSearch.prototype.getFormValues = function() {
  var aIds = ['ss','sg','sby','sdy','sp','sss','sgs','ssf','sgf','ssm','sgm'];
  for (var iId=0, nIds = aIds.length; iId < nIds; iId++) {
    $('#' + aIds[iId]).val(oStorage.getItem('search-field-' + aIds[iId]));
  };
};

SSSearch.prototype.getNamePeople = function(oPerson, oField) {
  var aPeople = [];

  if (!oField.person) {
    // Subject
    aPeople.push(oPerson);

  } else if (oField.person=="s") {
    // Spouses
    if (oPerson.s) {
      for (var iSpouse = 0, nSpouses = oPerson.s.length; iSpouse < nSpouses; iSpouse++) {
        aPeople.push(ss_search_data.people[oPerson.s[iSpouse]]);
      };
    };

  } else if (oPerson[oField.person]) {
    // Father or mother
    aPeople.push(ss_search_data.people[oPerson[oField.person]]);
  };

  return aPeople;
};

SSSearch.prototype.doSearch = function(page) {
  // Execute a search
  $('#ssSearch_results').html('');
  $('#ssSearch_results').hide();
  $('#page').val(0);

  this.oOptions.basicSearch = !$('div.search-set-method input').prop('checked');
  var oFields = new SSSearchFields(this.oOptions);
  ss_search_data.oOptions = $.extend({}, ss_search_data.oOptions, this.oOptions);
  var sNamePart = '';
  var nComps = 0;
  this.nMatches = 0;

  var startTime = new Date();

  // If we have any search fields, loop over the people
  if (oFields.length>0) {
    // Determine the minimum number of field matches
    // we need to include person in results
    var nMinFieldMatches = Math.min(oFields.nameFilters,4) + oFields.yearFilters + (oFields.placeFilters > 0 ? 1 : 0);
    nMinFieldMatches = Array(0,1,1,2,2,3,3,3)[nMinFieldMatches];

    var aResults = [];  // Add people who match here
    for (var key in ss_search_data.people) {
      var weight = 0;
      var bPlace = false;
      var oPerson = ss_search_data.people[key];
      oPerson.hp = -1;
      var nFieldMatches = 0;

      // Perform comparisons
      for (var iField = 0, nFields = oFields.length; iField < nFields; iField++) {
        var oField = oFields[iField];

        if (oField.type == 'name') {
          var aPeople = this.getNamePeople(oPerson, oField);
          nameLoop:
          for (var iPeople = 0, nPeople = aPeople.length; iPeople < nPeople; iPeople++) {
            var oNamePerson = aPeople[iPeople];
            for (var iName = 0, nNames = oNamePerson.n.length; iName < nNames; iName++) {
              if ([oField.name]=='s') {
                sNamePart = ss_search_data.strings[oNamePerson.n[iName][0]];
              } else {
                sNamePart = ss_search_data.getOtherName(oNamePerson, iName);
              };
              nComps++;
              if (sNamePart.search(oField.re) != -1) {
                weight += oField.weight;
                if (iName > 0) weight += this.oOptions.nonPrimaryWeight;
                nFieldMatches++;
                break nameLoop;
              };
            };
          };

        } else if (oField.type == 'year') {
          if (oPerson.u[oField.index]) {
            var year = this.baseYear - oPerson.u[oField.index];
            nComps++;
            if ((year >= oField.low) && (year <= oField.high)) {
              var difference = Math.abs(oField.value - year);
              weight += oField.weight - (difference * this.oOptions.circaWeight);
              nFieldMatches++;
            };
          };

        } else if (oField.type == 'place') {
          if (oPerson.p) {
            for (var iPlace = 0, nPlaces = oPerson.p.length; iPlace < nPlaces; iPlace++) {
              var sPlace = ss_search_data.places[oPerson.p[iPlace]];
              nComps++;
              if (sPlace.search(oField.re) != -1) {
                if (bPlace) {
                  weight += this.oOptions.placePartWeight;
                } else {
                  oPerson.hp = oPerson.p[iPlace];
                  weight += oField.weight;
                  nFieldMatches++;
                };
                bPlace = true;
                break;
              };
            };
          };
        };
      };

      // Add people who match to results
      if (weight > 0 && nFieldMatches >= nMinFieldMatches) {
        ss_search_data.people[key].w = weight;
        aResults[this.nMatches] = oPerson;
        this.nMatches++;
      };
    };
    this.nComparisons = nComps;
    this.nElapsed = ((new Date)-startTime);

    // Create result list
    if (this.nMatches > 0) {
      $('#page').val(page);
      this.nMaxWeight = oFields.getMaxWeight();
      this.nThreshold = Math.floor(this.nMaxWeight*this.oOptions.thresholdFactor);

      // Add top navigation
      this.addPageNavigation(page, aResults, true);

      // Sort the results
      aResults.sort(function(a,b) {
        // Sort the results by weight (descending), surname, given, birth
        if (a.w !== b.w) return (b.w - a.w);

        // Get surnames and compare
        var aS = ss_search_data.strings[a.n[0][0]];
        var bS = ss_search_data.strings[b.n[0][0]];
        if (aS < bS) return -1;
        if (aS > bS) return 1;

        // Get given and compare
        aS = ss_search_data.strings[a.n[0][1]];
        bS = ss_search_data.strings[b.n[0][1]];
        if (aS < bS) return -1;
        if (aS > bS) return 1;

        if (a.b > b.b) return -1;
        if (a.b < b.b) return 1;

        return 0;
      });

      // Add current page from results
      $('#ssSearch_results').append(this.getPage(page, aResults));

      // Add bottom navigation
      this.addPageNavigation(page, aResults, false);

    } else {
      // No matches
      $('#ssSearch_results').html(this.oOptions.stringNoMatches);
    };
    $('#ssSearch_results').show();
  };
};

SSSearch.prototype.getStats = function() {
  var nPeople = 0, nNames = 0, nPlaces = 0;
  for (var key in ss_search_data.people) {
    var oPerson = ss_search_data.people[key];
    nPeople++;
    if (oPerson.n) nNames += oPerson.n.length;
    if (oPerson.p) nPlaces += oPerson.p.length;
  };
  var sOut = '';

  sOut += "People: {0}\n".substitute(ss.addCommas(nPeople));
  sOut += "Names: {0}\n".substitute(ss.addCommas(nNames));
  sOut += "Name Strings: {0}\n".substitute(ss.addCommas(ss_search_data.strings.length));
  if (ss_search_data.places.length) {
    sOut += "Place References: {0}\n".substitute(ss.addCommas(nPlaces));
    sOut += "Places: {0}\n".substitute(ss.addCommas(ss_search_data.places.length));
  };
  if (this.nComparisons > 0) {
    sOut += "Last search:\n";
    sOut += "  Elapsed time: {0}ms\n".substitute(ss.addCommas(this.nElapsed));
    sOut += "  Comparisons: {0}\n".substitute(ss.addCommas(this.nComparisons));
    sOut += "  People matched: {0}\n".substitute(ss.addCommas(this.nMatches));
  };
  return sOut;
};

SSSearch.prototype.itemsOnPage = function(page, aResults) {
  // Get item numbers and count for the given page
  var nFirst = (page-1)*this.oOptions.itemsPerPage;
  var nLast = Math.min(aResults.length, nFirst+this.oOptions.itemsPerPage);
  return {'first':nFirst, 'last':nLast-1, 'count':nLast - nFirst};
};

SSSearch.prototype.getPage = function(page, aResults) {
  // Get a page of results
  var oItemNumbers = this.itemsOnPage(page, aResults);
  var nStart = oItemNumbers.first;
  var nEnd = oItemNumbers.last+1;
  var sOut = '';

  sOut += '<ul class="ssSearch_results">';
  for (var i = nStart; i < nEnd; i++) {
    var oItem = aResults[i];
    if (aResults[i].w < this.nThreshold && ((i==0) || (aResults[i-1].w >= this.nThreshold))) {
      sOut += '<li class="threshold">' + this.oOptions.stringNotClose + '</li>';
    };
    sOut += '<li>';
    if (oItem.u[1]) {
      sOut += '<a title="' + oItem.w + '" href="' + ss_search_data.getPersonUrl(oItem) +
          '">' + ss_search_data.getPersonName(oItem) + '</a>';
    } else {
      sOut += ss_search_data.getPersonName(oItem);
    };
    sOut += ss_search_data.getPersonSummary(oItem);
    sOut += '</li>';
  };
  sOut += '</ul>';
  return sOut;
};

SSSearch.prototype.addPageNavigation = function(page, aResults, top) {
  // Make a set of page navigation buttons
  var oItemNumbers = this.itemsOnPage(page, aResults);

  // Always make buttons on top; make bottom buttons only
  // if there are more than 10 results on the page
  if (top || oItemNumbers.count > 10) {
    page -= 1;
    if (this.nMatches > this.oOptions.itemsPerPage) {
      var pages = Math.min(this.oOptions.maxPages, Math.ceil(this.nMatches / this.oOptions.itemsPerPage));

      var $list = $('<ul class="ssSearch_pages"/>');
      $('#ssSearch_results').append($list);

      this.addPageButton($list, page, this.oOptions.stringPrevious, (page>0), false);

      for (var iPage = 0; iPage < pages; iPage++) {
        this.addPageButton($list, iPage+1, iPage+1, (iPage != page), (iPage == page));
      };

      this.addPageButton($list, page+2, this.oOptions.stringNext, (page+1 < pages), false);
    };
  };

  // Add item summary after top buttons
  if (top) {
    var out = '<div class="ssSearch_count" title="max weight=' + this.nMaxWeight + ', threshold=' + this.nThreshold + '">';
    out += this.oOptions.stringResults.substitute(
        ss.addCommas(oItemNumbers.first+1),
        ss.addCommas(oItemNumbers.last+1),
        ss.addCommas(aResults.length)
    );
    out += '</div>';
    $('#ssSearch_results').append(out);
  };
};

SSSearch.prototype.addPageButton = function($list, page, sLabel, bEnabled, bCurrent) {
  // Make a page navigation button
  var out = '<li';
  if (bEnabled) {
    out += '><a class="enabled" href="#">' + sLabel + '</a>';
  } else if (bCurrent) {
    out += ' class="disabled current">' + sLabel;
  } else {
    out += ' class="disabled">' + sLabel;
  };
  out += '</li>';
  var $button = $(out);
  $list.append($button);
  var that = this;
  if (bEnabled) {
    $button.click(function() {
      that.doSearch(page);
      return false;
    });
  };
};