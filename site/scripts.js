if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  };
};
String.prototype.ltrim = function() {
  return this.replace(/^\s+/,'');
};
String.prototype.rtrim = function() {
  return this.replace(/\s+$/,'');
};
String.prototype.right = function(len) {
  return this.substr(this.length-len);
};
String.prototype.left = function(len) {
  return this.substr(0,len);
};
String.prototype.consoleEscape = function() {
  return this.replace(/\\/g, '\\');
};
String.prototype.htmlEscape = function() {
  return this.replace(/[\u00A0-\u2666&]/g, function(c) {
      return '&#'+c.charCodeAt(0)+';';
  });
};
String.prototype.substitute = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};
var oStorage = (new StorageMethod).obj;

// Initialize things
$(document).ready(function() {
  initFex();
  initPageToc();
  initQuote();
});

function initPageToc() {
  // The page "table of contents" creates a list of
  // h2 tags on the page if it finds an element with
  // the id "pagetoc". It only functions if
  // JavaScript is supported, and enabled, and if
  // the user has added HTML similar to the
  // following in one of the static content
  // sections:

  // <div id="pagetoc"></div>
  //    or
  // <ul id="pagetoc"></ul>

  // 2007-04-06 JFC Now allows pagetoc on UL or OL, or on
  //                container DIV

  var $outerElement = $('#pagetoc');

  if ($outerElement.length>0) {
    var $tocElement = $outerElement.children("ul,ol").filter(":first");

    // Toggling display from none to block speeds
    // up execution, presumably because the browser
    // ignores the new content as it is being
    // added, and only computes locations, size, etc.
    // once at the end. That's just a guess based
    // on observing Firefox. If it actually isn't
    // faster, it seems like it, and that's good
    // enough for me in this case.
    $outerElement.hide();

    if ($tocElement.length>0) {
      // ul or ol is outer element
      $tocElement = $outerElement;
      // If ul or ol has elements, remove the first.
      // That way, user can provide
      //     <ul id="pagetoc"><li></li></ul>
      // to avoid validation errors.
      $tocElement.find(':first-child').remove();
    } else {
      $tocElement = ($outerElement).append("<ul></ul>").children();
    };
    addPageToc($tocElement);
    $outerElement.show();
  };
};

function addPageToc($tocElement) {
  var $content = $('#content');
  $(ss.pageTocElements,$content).each( function(index) {
    var eListElement = document.createElement('li');
    eListElement.className = 'toc'+this.tagName.toLowerCase();

    // Get text of H2 and add to TOC as link

    // Remove all child elements; we want H2 text only
    var sItemText = $(this).clone().children().remove().end().text();
    if (sItemText=='') sItemText = $(this).text();
    var nText = document.createTextNode(sItemText);
    var eLinkElement = document.createElement('a');
    eLinkElement.appendChild(nText);
    eListElement.appendChild(eLinkElement);

    // Set ID of H2 node if it doesn't have one
    if (!this.id) this.id = 't'+index;

    // Set target of the A tag we are adding to ID of H2
    eLinkElement.href = '#' + this.id;
    $tocElement.append(eListElement);
  });
};

function initQuote() {
  // Initializes the "random quote" facility

  // <ul class="randomquote"><li> ... </li> etc. </ul>
  //      or
  // <div class="randomquote"><ul><li> ... </li> etc. </ul></div>

  $('ul.randomquote,div.randomquote ul').each( function() {
    pickQuote(this);
  });
  $('ul.randomquote,div.randomquote,div.randomquote ul').show();
};

function pickQuote(eUL) {
  // Hide all but one child (LI) element
  var $listItems = $(eUL).children('li');
  var iIndex = Math.floor(Math.random()*$listItems.length);
  $listItems.hide();
  $listItems.eq(iIndex).show();
};

function getNodeText(target) {
  return $(target).contents().filter(function() {
        return this.nodeType == 3;
      }).text();
};

function hemlinksc(part1, part2, part3) {
  var loc = '';

  loc = 'm'+"A";loc=loc+"i"+"l"+"to"+":";
  loc = loc.toLowerCase()+part1+"@"+part2;
  if (part3) {
    loc = loc+'?SUBJECT='+part3;
  };
  location.href=loc;
};

function hemlink(part1, part2) {
  var sTitle;
  if ($('#personpages').length > 0) {
    sTitle = ss.wrapper('', $('html').data('site-title'), ' - ')
          + getNodeText('#header h1');
  };
  if (!sTitle) sTitle = document.title;
  hemlinksc(part1, part2, fixTitle(sTitle)+hemPersonHash());
};

function hemlinknc(part1, part2) {
  hemlinksc(part1, part2);
};

function fixTitle(title) {
  // Fix issues with ampersands in titles sent to mailto links
  var sTitle = title.replace(/&amp;/gi,'&');
  return sTitle.replace(/&/g,'%26');
};

function hemPersonHash() {
  // Return the hash if it looks like a person hash (#iNNN)
  var oPattern = /^#i[0-9]+$/;
  if (oPattern.test(location.hash)) {
    return ' (' + location.hash + ')';
  } else {
    return '';
  };
};

function tip(on_this, on_event, content) {
  return makeTrue(domTT_activate(on_this, on_event, 'content', content));
};

function tipcap(on_this, on_event, content, caption) {
  return makeTrue(domTT_activate(on_this, on_event, 'content', content, 'caption', caption));
};

/*
  parseUri 1.2.1
  (c) 2007 Steven Levithan <stevenlevithan.com>
  MIT License
*/
function parseUri (str) {
  var o = parseUri.options,
    m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
    uri = {},
    i = 14;

  while (i--) uri[o.key[i]] = m[i] || "";

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) uri[o.q.name][$1] = $2;
  });

  return uri;
};

parseUri.options = {
  strictMode: false,
  key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
  q:   {
    name:   "queryKey",
    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  parser: {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  }
};

// Load framed Second Site pages in proper frame
function ssFramer(destFrame) {
  var sDestFrame = destFrame;
  $(document).ready( function() {
    var kFrameset = "index.htm";
    var windowUri = parseUri(window.location.href);

    if (windowUri.file == '' ||
        windowUri.file.toLowerCase() == kFrameset) {
      // Handle parent page
      // Argument format: ?framename1=uri;anchor&framename2=uri;anchor...
      // Ex: ?ssmain=p1.htm;i32&ssindex=i1.htm;s37
      // Loads: p1.htm#i32 in frame "ssmain"
      // Loads: i1.htm#s37 in frame "ssindex"

      // Process frame arguments
      for (var sArg in windowUri.queryKey) {
        // Get frame URIs from frame name/anchor arguments
        var parts = windowUri.queryKey[sArg].split(';');
        window.frames[sArg].location.href = parts[0]+(parts.length>1 ? '#'+parts[1] : '');
      };

    } else {
      // Handle child page
      if (window.location == parent.location) {
        // Not in parent frame; reload parent
        // with arguments set to load child
        var oDest = ssFramerDestination(windowUri);
        var sUrl = oDest.prefix+kFrameset+'?'+sDestFrame+'='+oDest.file+';'+windowUri.anchor;
        window.location.href=sUrl;
      };
    };
  });
};

function ssFramerDestination(windowUri) {
  // Return Url prefix and filename adjusted for (possible) group folder
  var oDest = [];
  var aFolder = windowUri.directory.match(/(\/)(g[0-9]+\/)$/)
  if (aFolder) {
    oDest.prefix = '../';
    oDest.file = aFolder[2]+windowUri.file;
  } else {
    oDest.prefix = '';
    oDest.file = windowUri.file;
  };
  return oDest;
};

// Compress person pages to collapsible list of people
function onePersonPerPage() {
  var pH = /^#i[0-9]/;    // Limit to person targets
  function showPeople(hash) {
    var pid = hash.replace(/^#[ic]([0-9]+)(.*)/i, '#i$1');
    if (pH.test(pid)) {
      // React to person hash
      var $el = $(pid);
      $('#content div.itp').filter(":visible").hide();
      $('#fex').hide();
      $el.show();
      // Scroll to target
      target = hash.substr(1);
      document.getElementById(target).scrollIntoView(true);
      // Set page title to h2.sn text content
      var sNewTitle = getNodeText(hash+' h2.sn');
      $('#header h1').html(sNewTitle);
    }
    else if (hash == '') {
      $('#content div.itp').filter(":hidden").show();
      $('#header h1').html($('html').data('page-title'));
    };
  };

  function initialize() {
    // Watch for changes to the hash (target)
    $(window).hashchange(function(e){
      showPeople(location.hash);
    });

    // Adjust to page load conditions
    showPeople(location.hash);
  };

  // Only valid on person pages
  if ($('#personpages').length > 0) initialize();
};

var ss = function() {
  var bMapEditor = false;

  /**
   * parseColor parses CSS color values. It is based
   * on RGBColor by Stoyan Stefanov <sstoo@gmail.com>,
   * rewritten by John Cardinal to improve performance and
   * make it more compatible with my applications and coding
   * style.
   */

  function parseColor(sColor) {
    // Constructor for parseColor object.
    // sColor is optional; if provided,
    // it will be parsed. Otherwise, call the
    // parseColor.parse(sColor) method.

    var self = this;
    this.r = this.g = this.b = 0;
    this.color_names = {
      'aliceblue': 'f0f8ff',
      'antiquewhite': 'faebd7',
      'aqua': '00ffff',
      'aquamarine': '7fffd4',
      'azure': 'f0ffff',
      'beige': 'f5f5dc',
      'bisque': 'ffe4c4',
      'black': '000000',
      'blanchedalmond': 'ffebcd',
      'blue': '0000ff',
      'blueviolet': '8a2be2',
      'brown': 'a52a2a',
      'burlywood': 'deb887',
      'cadetblue': '5f9ea0',
      'chartreuse': '7fff00',
      'chocolate': 'd2691e',
      'coral': 'ff7f50',
      'cornflowerblue': '6495ed',
      'cornsilk': 'fff8dc',
      'crimson': 'dc143c',
      'cyan': '00ffff',
      'darkblue': '00008b',
      'darkcyan': '008b8b',
      'darkgoldenrod': 'b8860b',
      'darkgray': 'a9a9a9',
      'darkgrey': 'a9a9a9',
      'darkgreen': '006400',
      'darkkhaki': 'bdb76b',
      'darkmagenta': '8b008b',
      'darkolivegreen': '556b2f',
      'darkorange': 'ff8c00',
      'darkorchid': '9932cc',
      'darkred': '8b0000',
      'darksalmon': 'e9967a',
      'darkseagreen': '8fbc8b',
      'darkslateblue': '483d8b',
      'darkslategray': '2f4f4f',
      'darkslategrey': '2f4f4f',
      'darkturquoise': '00ced1',
      'darkviolet': '9400d3',
      'deeppink': 'ff1493',
      'deepskyblue': '00bfff',
      'dimgray': '696969',
      'dimgrey': '696969',
      'dodgerblue': '1e90ff',
      'firebrick': 'b22222',
      'floralwhite': 'fffaf0',
      'forestgreen': '228b22',
      'fuchsia': 'ff00ff',
      'gainsboro': 'dcdcdc',
      'ghostwhite': 'f8f8ff',
      'gold': 'ffd700',
      'goldenrod': 'daa520',
      'gray': '808080',
      'grey': '808080',
      'green': '008000',
      'greenyellow': 'adff2f',
      'honeydew': 'f0fff0',
      'hotpink': 'ff69b4',
      'indianred': 'cd5c5c',
      'indigo': '4b0082',
      'ivory': 'fffff0',
      'khaki': 'f0e68c',
      'lavender': 'e6e6fa',
      'lavenderblush': 'fff0f5',
      'lawngreen': '7cfc00',
      'lemonchiffon': 'fffacd',
      'lightblue': 'add8e6',
      'lightcoral': 'f08080',
      'lightcyan': 'e0ffff',
      'lightgoldenrodyellow': 'fafad2',
      'lightgreen': '90ee90',
      'lightgray': 'd3d3d3',
      'lightgrey': 'd3d3d3',
      'lightpink': 'ffb6c1',
      'lightsalmon': 'ffa07a',
      'lightseagreen': '20b2aa',
      'lightskyblue': '87cefa',
      'lightslategray': '778899',
      'lightslategrey': '778899',
      'lightsteelblue': 'b0c4de',
      'lightyellow': 'ffffe0',
      'lime': '00ff00',
      'limegreen': '32cd32',
      'linen': 'faf0e6',
      'magenta': 'ff00ff',
      'maroon': '800000',
      'mediumaquamarine': '66cdaa',
      'mediumblue': '0000cd',
      'mediumorchid': 'ba55d3',
      'mediumpurple': '9370db',
      'mediumseagreen': '3cb371',
      'mediumslateblue': '7b68ee',
      'mediumspringgreen': '00fa9a',
      'mediumturquoise': '48d1cc',
      'mediumvioletred': 'c71585',
      'midnightblue': '191970',
      'mintcream': 'f5fffa',
      'mistyrose': 'ffe4e1',
      'moccasin': 'ffe4b5',
      'navajowhite': 'ffdead',
      'navy': '000080',
      'oldlace': 'fdf5e6',
      'olive': '808000',
      'olivedrab': '6b8e23',
      'orange': 'ffa500',
      'orangered': 'ff4500',
      'orchid': 'da70d6',
      'palegoldenrod': 'eee8aa',
      'palegreen': '98fb98',
      'paleturquoise': 'afeeee',
      'palevioletred': 'db7093',
      'papayawhip': 'ffefd5',
      'peachpuff': 'ffdab9',
      'peru': 'cd853f',
      'pink': 'ffc0cb',
      'plum': 'dda0dd',
      'powderblue': 'b0e0e6',
      'purple': '800080',
      'red': 'ff0000',
      'rosybrown': 'bc8f8f',
      'royalblue': '4169e1',
      'saddlebrown': '8b4513',
      'salmon': 'fa8072',
      'sandybrown': 'f4a460',
      'seagreen': '2e8b57',
      'seashell': 'fff5ee',
      'sienna': 'a0522d',
      'silver': 'c0c0c0',
      'skyblue': '87ceeb',
      'slateblue': '6a5acd',
      'slategray': '708090',
      'slategrey': '708090',
      'snow': 'fffafa',
      'springgreen': '00ff7f',
      'steelblue': '4682b4',
      'tan': 'd2b48c',
      'teal': '008080',
      'thistle': 'd8bfd8',
      'tomato': 'ff6347',
      'turquoise': '40e0d0',
      'violet': 'ee82ee',
      'wheat': 'f5deb3',
      'white': 'ffffff',
      'whitesmoke': 'f5f5f5',
      'yellow': 'ffff00',
      'yellowgreen': '9acd32'
    };

    // Array of functions to parse CSS color strings
    this.parsers = [
      // Handles "ffffff" form
      function(sColor) {
        if (sColor.length==6) {
          self.r = parseInt(sColor.substr(0,2), 16);
          self.g = parseInt(sColor.substr(2,2), 16);
          self.b = parseInt(sColor.substr(4,2), 16);
          return true;
        };
      },
      // Handles "fff" form
      function(sColor) {
        if (sColor.length==3) {
          var c = sColor.charAt(0);
          self.r = parseInt(c+c, 16);
          c = sColor.charAt(1);
          self.g = parseInt(c+c, 16);
          c = sColor.charAt(2);
          self.b = parseInt(c+c, 16);
          return true;
        };
      },
      // Handles "rgb(255,255,255)" form
      function(sColor) {
        var parts = sColor.match(/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/);
        if (parts) {
          self.r = parseInt(parts[1]);
          self.g = parseInt(parts[2]);
          self.b = parseInt(parts[3]);
          return true;
        };
      },
      // Last variation sets values to 0
      function(sColor) {
        self.r = self.g = self.b = 0;
        return false;
      }
    ];

    if (sColor) {
      this.parse(sColor);
    };
  };

  parseColor.prototype.toHex = function() {
    var rX = ('0'+this.r.toString(16)).right(2);
    var gX = ('0'+this.g.toString(16)).right(2);
    var bX = ('0'+this.b.toString(16)).right(2);
    return '#' + rX + gX + bX;
  };

  parseColor.prototype.toRGB = function() {
    return 'rgb('+this.r+','+this.g+','+this.b+')';
  };

  parseColor.prototype.parse = function(sColor) {
    var result = false;

    // Remove #s and spaces
    sColor = sColor.toLowerCase().replace(/[# ]/g,'');

    // Check for named color
    if (this.color_names[sColor]) {
      sColor = this.color_names[sColor];
    };

    // Call the parsers until one indicates success
    for (var i = 0; i < this.parsers.length && !result; i++) {
      result = this.parsers[i](sColor);
    };

    if (result) {
      // validate/cleanup values
      this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
      this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
      this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);
    };

    return result;
  };

  return {
    enableMapEditor: function(enable) { bMapEditor=enable; },
    isMapEditor: function() { return (bMapEditor); },

    extend: function(baseClass, subClass) {
      // Copied from Kevin Lindsey
      // http://www.kevlindev.com/tutorials/javascript/inheritance/index.htm
      function inheritance() {};
      inheritance.prototype = baseClass.prototype;

      subClass.prototype = new inheritance();
      subClass.prototype.constructor = subClass;
      subClass.baseConstructor = baseClass;
      subClass.superClass = baseClass.prototype;
    },

    // floating point to decimal degrees, 8 digits after decimal
    fpdd: function(float) { return (float.toFixed(8)) },

    propsToString: function(theObject, prefix, suffix) {
      var sProps = '';
      var sDelim = '';

      for (var prop in theObject) {
        if (typeof(theObject[prop]) != 'function' &&
            typeof(theObject[prop]) != 'object') {
          sProps += '<span title="'+typeof(theObject[prop])+'">';
          sProps += (prefix ? prefix : sDelim) + '&nbsp;' + prop + ':' + theObject[prop] + (suffix ? suffix : '')+'</span>';
          sDelim = ', ';
        };
      };
      return sProps;
    },

    parseColor: parseColor,

    imageAnchorBuilder: function(index, slide, width, height) {
      return '<li><a href="#"><img src="' + slide.src + '" width="' + width + '" height="' + height + '"/></a></li>';
    },

    divAnchorBuilder: function(index, slide, width, height) {
      var src = $('img',slide).attr('src');
      return '<li><a href="#"><img src="' + src + '" width="' + width + '" height="' + height + '"/></a></li>';
    },

    getSiblCaption: function(element) {
      return $(element).parent().parent().children('div.egic').html();
    },

    getUseMapFromId: function(sId) {
      if (sId) {
        return ' usemap="#' + sId.replace(/^img/i,'map') + '"';
      } else {
        return '';
      };
    },

    addLightBoxes: function(id, cssClass, tipOpen, tipLink) {
      // Add lightboxes for gallery images and pictures user items
      var sSelector = '#' + id + (cssClass=='egib' ? ' div.egib' : '');
      var sCaptionClass = (cssClass=='egib' ? 'egic' : cssClass+'c');

      $(sSelector).each( function(index) {
        // Change outer div to "position:relative" and add "sslbc" class
        $(this)
          .css({position:'relative', 'paddingTop':'21px'})
          .addClass('sslbc');

        // Add buttons
        if ($('a.sslbPage',this).length) {
          $(this).append('<button class="iconlink" title="' + tipLink + '"/>' +
              '<button class="iconopen" title="' + tipOpen + '"/>');
        } else if ($('a.sslbImage',this).length) {
          $(this).append('<button class="iconopen" title="' + tipOpen + '"/>');
        };

        // Add click handler for iconlink buttons
        $(this).children('button.iconlink').click( function() {
          if (cssClass=='egib') {
            document.location = $(this).siblings().first().children('a.sslbPage').attr('href');
          } else {
            document.location = $(this).siblings('a.sslbPage').attr('href');
          };
        });
      });

      // Enable the imageBox for the iconopen buttons
      $('#'+id+' button.iconopen').imageBox({
        rel: (cssClass=='egib' ? id : cssClass),
        getCaption: function(element) {
          return $(element).siblings('div.'+sCaptionClass).html();
        },
        getHref: function(element) {
          var sHref = '';
          if (cssClass=='egib') {
            sHref = $(element).siblings().first().children('a.sslbImage').attr('href');
            if (!sHref) {
              sHref = $(element).siblings().first().children('a.sslbPage').attr('rel');
            };
          } else {
            sHref = $(element).siblings('a.sslbImage').attr('href');
            if (!sHref) {
              sHref = $(element).siblings('a.sslbPage').attr('rel');
            };
          };
          return sHref;
        },
        getUseMap: function(element) {
          var sId = '';
          if (cssClass=='egib') {
            sId = $(element).siblings().first().children('a.sslbImage').attr('id');
            if (!sId) {
              sId = $(element).siblings().first().children('a.sslbPage').attr('id');
            };
          } else {
            sId = $(element).siblings('a.sslbImage').attr('id');
            if (!sId) {
              sId = $(element).siblings('a.sslbPage').attr('id');
            };
          };
          return ss.getUseMapFromId(sId);
        }
      });

      // Enable the imageBox for the thumbnail images
      $('#'+id+' a.sslbImage').imageBox({
        rel: (cssClass=='egib' ? id+'a' : cssClass+'a'),
        getCaption: function(element) {
          if (cssClass=='egib') {
            return $(element).parent().parent().children('div.'+sCaptionClass).html();
          } else {
            return $(element).siblings('div.'+sCaptionClass).html();
          };
        },
        getUseMap: function(element) {
          return ss.getUseMapFromId($(element).attr('id'));
        }
      });
    },

    addExhibitLights: function(cssClass, tipOpen, tipLink) {
      // Add lightboxes for embedded exhibits
      var sSelector = 'div.'+cssClass;
      var sCaptionClass = cssClass+'c';

      $(sSelector).each( function(index) {
        if ($('a.sslbImage',this).length) {
          // Change outer div to "position:relative" and add "sslbc" class
          $(this)
            .css({position:'relative', 'paddingTop':'21px'})
            .addClass('sslbc');

          // Add button
          $(this).append('<button class="iconopen" title="' + tipOpen + '"/>');
        };
      });

      // Enable the imageBox for the iconopen buttons
      $(sSelector+' button.iconopen').imageBox({
        rel: 'nofollow',
        getCaption: function(element) {
          return $(element).siblings('div.'+sCaptionClass).html();
        },
        getHref: function(element) {
          return $(element).siblings('a.sslbImage').attr('href');
        },
        getUseMap: function(element) {
          return ss.getUseMapFromId($(element).siblings('a.sslbImage').attr('id'));
        }
      });

      // Enable the imageBox for the thumbnail images
      $(sSelector+' a.sslbImage').imageBox({
        rel: 'nofollow',
        getCaption: function(element) {
          return $(element).siblings('div.'+sCaptionClass).html();
        },
        getUseMap: function(element) {
          return ss.getUseMapFromId($(element).attr('id'));
        }
      });
    },

    initUpLinks: function(selector) {
      // Assigns a click handler to ensure target element is
      // visible and then set it as window location. Target
      // is provided via "rev=" attribute of elements
      // specified via selector.
      $(selector).show().click(function() {
        var element = $($(this).attr('rev'));
        while (!element.is(':visible')) {
          element = element.show().parent();
          element.swapClass('dv-expandable','dv-collapsible')
              .swapClass('dv-last-expandable','dv-last-collapsible');
        };
        window.location = $(this).attr('rev');
      });
    },

    openDescendViewAnchor: function(selector) {
      // Given an anchor on the current page, ensure target
      // element is visible and then set it as window location.
      var element = $(selector);
      while (!element.is(':visible')) {
        element = element.show().parent();
        element.swapClass('dv-expandable','dv-collapsible')
            .swapClass('dv-last-expandable','dv-last-collapsible');
      };
      window.location = selector;
    },

    getFeed: function(feedOptions) {
      function getFeedItem(entry, format) {
        var sItem = '<a class="feed-link ext" href="' + entry.link + '">' + entry.title + '</a>';
        sItem += '<div class="feed-date">' + (new Date(entry.publishedDate).toLocaleDateString()) + '</div>';

        if (format==='summary') {
          sItem += '<div class="feed-snippet">' + entry.contentSnippet + '</div>';
        } else if (format==='full') {
          sItem += '<div class="feed-content">' + entry.content + '</div>';
        };

        return sItem;
      };

      var opts = feedOptions;
      var feed = new google.feeds.Feed(opts.url);
      feed.setNumEntries(opts.max || 5)
      feed.load(function(result) {
        if (!result.error) {
          //Remove the "fall back" link
          $(opts.target + ' a.feed-link').remove();
          // Create the list of entries
          var sHtml = '<ul class="feed-list">';
          for (var i=0; i<result.feed.entries.length; i++) {
            sHtml += '<li class="feed-item">';
            sHtml += getFeedItem(result.feed.entries[i], opts.format);
            sHtml += '</li>';
          };
          sHtml += '</ul>';
          // Add the list to the page
          $(opts.target).append(sHtml);

        } else {
          $(opts.target + ' a.feed-link').attr('title', result.error.message);
        };
      });
    },

    showPopup: function(text, userClass) {
      function popupClose() {
        $(window).unbind('resize.ss-popup');
        $('#popup-mask, #popup-content').hide();
      };

      if ($('#popup-mask').length == 0) {
        $('#content').append('<div id="popup-mask"/><div id="popup-content"/>');

        // Close button click
        $('#popup-content').on('click', '.popup-close', function(e) {
            // Cancel the link behavior
            e.preventDefault();
            popupClose();
        });

        // Mask click
        $('#popup-mask').click(function () {
            popupClose();
        });
      };
      // Set resize handler unless called recursively
      if ($('#popup-mask').css('display') == 'none') {
        $(window).bind('resize.ss-popup', function () {
          ss.showPopup(text, userClass);
        });
      };

      var docHeight = $(document).height();
      var winHeight = $(window).height();
      var winWidth = $(window).width();

      // Size mask and display
      $('#popup-mask').css({'width':winWidth,'height':docHeight,'opacity':0.6}).show();

      // Position the panel
      var $panelContent = $('#popup-content');
      $panelContent.removeClass()
          .addClass(userClass||'')
          .css({'width':Math.floor(winWidth*.75),'max-height':Math.floor(winHeight*.75)});
      $panelContent.html(text)
          .css({'top':Math.floor(winHeight/2-$panelContent.height()/2),
              'left':Math.floor(winWidth/2-$panelContent.width()/2)})
          .show();
    },

    wrapper: function(prefix, text, suffix) {
      return (text ? prefix + text + suffix : '');
    },

    addCommas: function(num) {
      var re = /(\d+)(\d{3})/;

      num += '';
      var parts = num.split('.',2);
      var intPart = parts[0];
      while (re.test(intPart)) {
        intPart = intPart.replace(re, '$1' + ',' + '$2');
      };
      return intPart + (parts.length > 1 ? '.' + parts[1] : '');
    },

    pageTocElements: 'h2'
  }
}();

function initCalendar(id, data) {
  var oCalendar = new SSCalendar(id);
  // Store object off the element so we
  // can access it via element
  $('#'+id).data('obj', oCalendar);

  // Save data and make calendar
  oCalendar.data = data;
  oCalendar.filetype = data.filetype;
  oCalendar.days = data.days;
  oCalendar.months = data.months;
  if (data.range=='Day') {
    oCalendar.makeDayCalendar();
  } else {
    oCalendar.makeMonthCalendar();
  };
};

function SSCalendar(id) {
  this.id = id;
  this.storageKey = id+'|year|month|day';
  this.maxDays = 32;    // days in longest month, plus one
  this.calendarDate = new Date();

  var sValue = oStorage.getItem(this.storageKey);
  if (sValue) {
    var sParts = sValue.split('|');
    this.calendarDate = new Date(sParts[0], sParts[1], sParts[2]);
  };
};

SSCalendar.prototype.makeDayCalendar = function() {
  // var days = this.getDaysInMonth(this.calendarDate.getMonth());
  var sDays = this.getEventsForMonth(this.calendarDate.getMonth());

  $('#'+this.id+' div.calday').html( this.getDayHTML(sDays) );

  this.setDayHandlers();
};

SSCalendar.prototype.getDayHTML = function(sDays, dDate) {
  var iDay = this.calendarDate.getDate();
  var iMonth = this.calendarDate.getMonth();
  var iYear = this.calendarDate.getYear();
  var sW = '';

  sW += '<div class="calcaption" style="position:relative;padding:0 15px;min-height:21px;">';
  sW += '<button class="calprev"></button><button class="calnext"></button>';
  sW += this.months[iMonth] + ' ' + iDay + '</div>';
  sW += sDays[iDay];

  if (sDays[iDay]=='') sW += this.data.stringNoEvents;

  // Add "in month" events if we are showing the 1st of the month
  if (iDay==1 && sDays[0]!=='') {
    sW += '<div class="calcaption">' + this.months[iMonth] + '</div>';
    sW += sDays[0];
  };

  // Add events on 29th if we are showing 28th of Feb in non-leap year
  if (iMonth==1 && iDay==28 && sDays[29]!=='' && iYear%4!==0) {
    sW += '<div class="calcaption">' + this.months[iMonth] + ' ' + (iDay+1) + '</div>';
    sW += sDays[29];
  };

  return sW;
};

SSCalendar.prototype.makeMonthCalendar = function() {
  var iDay;
  this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth(), 1);

  var days = this.getDaysInMonth(this.calendarDate.getMonth());
  var sDays = this.getEventsForMonth(this.calendarDate.getMonth());
  var oCells = this.getCalendarCells(sDays, days, this.calendarDate.getDay());

  $('#'+this.id+' div.caltable').html( this.getMonthHTML(sDays, oCells) );

  this.setMonthHandlers();
};

SSCalendar.prototype.getMonthHTML = function(sDays, oCells) {
  // getMonthHTML creates the HTML to display a month.

  var nWeeks = oCells.length/7;
  var iMonth = this.calendarDate.getMonth();
  var iYear = this.calendarDate.getFullYear();
  var iCell = 0;
  var oCell;
  var sW = '';

  // Heading row with controls, month, year
  sW += '<table class="caltable"><thead>' +
      '<tr class="calmth"><th colspan="7">' +
      '<div style="position:relative; margin: 0 auto; width: 14em;">' +
      '<button class="calprev"></button>' +
      '<button class="calnext"></button>' + this.months[iMonth]+' '+iYear +
      '</div></th></tr>';

  // Heading row with days of week
  sW += '<tr class="caldow">';
  for (iDay=0; iDay<7; iDay++) {
    sW += '<th>'+this.days[iDay]+'</th>';
  };
  sW += '</tr></thead>';

  // Rows with event data
  sW += '<tbody>';
  for (var iWeek=0; iWeek<nWeeks; iWeek++) {
    sW += '<tr>';
    for (var iDay=0; iDay<7; iDay++) {
      oCell = oCells[iCell];
      if (oCell.css != '') {
        sW += '<td class="'+oCell.css+'"';
        if (oCell.colspan>1) sW += ' colspan="'+oCell.colspan+'"';
        sW += '>';
        if (oCell.dayNumber>0) {
          sW += '<div class="caldn';
          if (iMonth==1 && oCell.dayNumber==29) {
            if (!this.isLeapYear(iYear)) sW += ' caldn29';
          };
          sW += '">'+oCell.dayNumber+'</div>';
        };
        if (oCell.daysIndex != -1) sW += sDays[oCell.daysIndex];
        sW += '</td>';
      };
      iCell++;
    };
    sW += '</tr>';
  };
  sW += '</tbody></table>';
  return sW;
};

SSCalendar.prototype.getPersonUrl = function(p) {
  // Make a URL from the group, page, and ID
  var sPage =  'p' + p[1] + '.' + this.filetype;
  if (p[2]) sPage += '#i' + p[2];
  if (typeof p[0] != 'undefined') {
    return 'g' + p[0] + '/' + sPage;
  } else {
    return sPage;
  };
};

SSCalendar.prototype.getPerson = function(p) {
  // Make link to person if we can
  if (p[1]) {
    return '<a href="' + this.getPersonUrl(p) + '">' + p[3] + '</a>';
  } else {
    return p[3];
  };
};

SSCalendar.prototype.getPeople = function(p) {
  var sOut = "";
  for (var i=0; i<p.length; i++) {
    if (sOut) sOut += " &amp; ";
    sOut += this.getPerson(p[i]);
  };
  return sOut;
};

SSCalendar.prototype.getEventsForMonth = function(nMonth) {
  /* Load event text into sDays array based on day number.
     Note that months and days are 1-origin in JSON data.
     Month events (no day) are stored in sDays[0].
  */
  var sDays = new Array(this.maxDays);
  var iDay;
  var oCalEvt;

  // Initialize the array
  for (iDay=0; iDay<this.maxDays; iDay++) sDays[iDay]='';

  for (iEvent=0; iEvent<this.data.events.length; iEvent++) {
    oCalEvt = this.data.events[iEvent];
    if (oCalEvt.m==nMonth+1) {
      iDay = oCalEvt.d;
      sDays[iDay] += '<div class="calevt">' +
          '<span class="calppl">'+this.getPeople(oCalEvt.p)+'</span>' +
          '<span class="calnot">('+oCalEvt.n+')</span>' +
          '</div>';
    };
  };

  // Fix HTML characters
  for (iDay=0; iDay<this.maxDays; iDay++) {
    sDays[iDay]=sDays[iDay].replace(/&gt;/gi, '>');
    sDays[iDay]=sDays[iDay].replace(/&lt;/gi, '<');
    sDays[iDay]=sDays[iDay].replace(/&amp;/gi, '&');
  };
  return sDays;
};

SSCalendar.prototype.getCalendarCells = function(sDays, days, firstDay) {
  /* Create cells for the grid that will represent the month.
     Cells are used during rendering stage (getHTML()) to
     control which days are in which cells, colspans, etc.
  */
  var oCells = new Array;
  var iDay;
  var iCell;
  var extraCells;

  // Adjust February if no 29th day events
  // and not leap year
  if ((days==29) && (sDays[29].length==0)) {
    iYear = this.calendarDate.getFullYear();
    if (!this.isLeapYear(iYear)) days=28;
  };

  if (firstDay>2) {
    // We have at least 3 empty days at
    // front, so put month events there

    // Cell for month events
    oCells.push ( {
      css: (sDays[0].length==0) ? 'calemp':'caloth',
      colspan: (firstDay),
      dayNumber: 0,
      daysIndex: 0 } );

    // Placeholder cells
    for (iCell=1; iCell<firstDay; iCell++) {
      oCells.push ( {
        css: '',
        colspan: 1,
        dayNumber: 0,
        daysIndex: -1 } );
    };

    // Cells for days in month
    for (iDay=1; iDay<=days; iDay++) {
      oCells.push ( {
        css: 'calday',
        colspan: 1,
        dayNumber: iDay,
        daysIndex: iDay } );
    };

    // Empty cells after end of month
    extraCells = 7-(oCells.length%7);
    if (extraCells==7) extraCells=0;
    for (iCell=0; iCell<extraCells; iCell++) {
      oCells.push ( {
        css: "calemp",
        colspan: 1,
        dayNumber: 0,
        daysIndex: -1 } );
    };
  } else {
    // Put month events at end

    // Empty cells before start of month
    for (iCell=0; iCell<firstDay; iCell++) {
      oCells.push ( {
        css: "calemp",
        colspan: 1,
        dayNumber: 0,
        daysIndex: -1 } );
    };

    // Cells for days in month
    for (iDay=1; iDay<=days; iDay++) {
      oCells.push ( {
        css: "calday",
        colspan: 1,
        dayNumber: iDay,
        daysIndex: iDay } );
    };

    // Room for other events in last
    // week of month?
    extraCells = 7-(oCells.length%7);
    if (extraCells<=2) {
      for (iCell=0; iCell<extraCells; iCell++) {
        oCells.push ( {
          css: "calemp",
          colspan: 1,
          dayNumber: 0,
          daysIndex: -1 } );
      };
      extraCells=7;
    };

    // Write other cell and extra cells unless
    // it's a whole row and no month events
    if ((extraCells!=7) || (sDays[0].length>0)) {
      // Cell for month events
      oCells.push ( {
        css: (sDays[0].length==0) ? 'calemp':'caloth',
        colspan: extraCells,
        dayNumber: 0,
        daysIndex: 0 } );

      // Placeholder cells
      for (iCell=1; iCell<extraCells; iCell++) {
        oCells.push ( {
          css: '',
          colspan: 1,
          dayNumber: 0,
          daysIndex: -1 } );
      };
    };
  };
  return oCells;
};

SSCalendar.prototype.setMonthHandlers = function() {
  /* setMonthHandlers adds handlers for controls
     that adjust current month.
  */
  var oCal = this;

  $('#'+this.id+' button.calprev').click(function() {
    oCal.adjustMonth(-1);
    oCal.makeMonthCalendar();
    return false;
  });

  $('#'+this.id+' button.calnext').click(function() {
    oCal.adjustMonth(1);
    oCal.makeMonthCalendar();
    return false;
  });
};

SSCalendar.prototype.adjustMonth = function(delta) {
  /* adjustMonth is called by control handlers
     to adjust the month up or down.
  */
  var iYear = this.calendarDate.getFullYear();
  var iMonth = this.calendarDate.getMonth()+delta;
  oStorage.setItem(this.storageKey, iYear+'|'+iMonth+'|1');
  this.calendarDate = new Date(iYear, iMonth, 1);
};

SSCalendar.prototype.setDayHandlers = function() {
  /* setDayHandlers adds handlers for controls
     that adjust current day.
  */
  var oCal = this;

  $('#'+this.id+' button.calprev').click(function() {
    oCal.adjustDay(-1);
    oCal.makeDayCalendar();
    return false;
  });

  $('#'+this.id+' button.calnext').click(function() {
    oCal.adjustDay(1);
    oCal.makeDayCalendar();
    return false;
  });
};

SSCalendar.prototype.adjustDay = function(delta) {
  /* adjustDay is called by control handlers
     to adjust the day up or down.
  */
  var iYear = this.calendarDate.getFullYear();
  var iMonth = this.calendarDate.getMonth();
  var iDay = this.calendarDate.getDate()+delta;
  oStorage.setItem(this.storageKey, iYear+'|'+iMonth+'|'+iDay);
  this.calendarDate = new Date(iYear, iMonth, iDay);
};

SSCalendar.prototype.getDaysInMonth = function(monthNo) {
  var days=[31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[monthNo];
};

SSCalendar.prototype.isLeapYear = function(yearNo) {
  return (new Date(yearNo, 1, 29).getMonth() == 1);
};

// *** SSIdLookup used by ID Lookup Form ***

function SSIdLookup(itemId) {
  this.itemId = itemId;
  this.filetype = 'htm';
  $('#'+itemId).show();
  this.setHandlers();
};

SSIdLookup.prototype.isValidId = function(id) {
  return (this.people[id]);
};

SSIdLookup.prototype.parseId = function() {
  var sId = $('#idNumber').val();
  return sId.replace(/[#,.]+/g,'');
};

SSIdLookup.prototype.getUrl = function(id) {
  // Make a URL to the person with the given TMG ID
  var u = this.people[id];
  var sPage = 'p' + u[1] + '.' + this.filetype;
  sPage += '#i' + id;
  if (typeof u[0] != 'undefined') {
    return 'g' + u[0] + '/' + sPage;
  } else {
    return sPage;
  };
};

SSIdLookup.prototype.setHandlers = function() {
  /* Add handlers for ID Lookup form
  */
  var oLookup = this;

  $('#idLookup_submit').click(function(e) {
    var sId = oLookup.parseId();
    if (oLookup.isValidId(sId)) {
      window.location.href = oLookup.getUrl(sId);
    };
    e.preventDefault();
    return false;
  });

  $('#'+this.itemId+' form input').keypress(function(e) {
    if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
      var deviceAgent = navigator.userAgent.toLowerCase();
      if (deviceAgent.match(/(iphone|ipod|ipad)/)) $(this).blur();  // Hide iOS keyboard
      $('#idLookup_submit').click();
      return false;
    } else {
      return true;
    };
  });

  $('#'+this.itemId+' form input').keyup(function(e) {
    var sId = oLookup.parseId();

    // If valid ID number for person
    // on site, enable submit button
    if (oLookup.isValidId(sId)) {
      $('#idLookup_submit').removeAttr('disabled');
    } else {
      $('#idLookup_submit').attr('disabled','disabled');
    };
    return true;
  });
};

// *** Person Information used by Search and Family Explorer ***

function SSSearchData() {
  this.baseYear=2100;
  this.oOptions = [];
  this.oOptions.groupPrefix = '';
  this.oOptions.surnameFirst = true;
};
SSSearchData.prototype.people = {};
SSSearchData.prototype.places = [];
SSSearchData.prototype.oOptions = [];

SSSearchData.prototype.getGivenname = function(person, index) {
  return this.strings[person.n[index][1]];
};

SSSearchData.prototype.getNameSuffix = function(person, index) {
  return this.strings[person.n[index][2]];
};

SSSearchData.prototype.getSurname = function(person, index) {
  return this.strings[person.n[index][0]];
};

SSSearchData.prototype.getOtherName = function(person, index) {
  var o = this.strings[person.n[index][1]];
  if (person.n[index][2]) {
    var s = this.strings[person.n[index][2]];
    if (s.substring(0, 1) !== ',') o += ', ';
    o += s;
  };
  return o;
};

SSSearchData.prototype.getPersonName = function(person, index) {
  index = index || 0;
  var s = this.getSurname(person, index);
  var sOut = '';

  if (this.oOptions.surnameFirst) {
    var on = this.getOtherName(person, index);
    if (s && on) {
      sOut = s + ', ' + on;
    } else {
      sOut = s || on;
    };
  } else {
    var gn = this.getGivenname(person, index);
    if (s && gn) {
      sOut = gn + ' ' + s;
    } else {
      sOut = s || gn;
    };
    var ns = this.getNameSuffix(person, index);
    if (ns) {
      sOut += ', ' + ns;
    }
  }
  return sOut.htmlEscape();
};

SSSearchData.prototype.getPersonUrl = function(person) {
  // Make a URL from the group, page, and ID
  var sPage = 'p' + person.u[1] + '.' + this.oOptions.filetype;
  if (person.u[2]) sPage += '#i' + person.u[2];
  if (typeof person.u[0] != 'undefined') {
    return this.oOptions.groupPrefix + 'g' + person.u[0] + '/' + sPage;
  } else {
    return sPage;
  };
};

SSSearchData.prototype.getPersonLink = function(person) {
  // Make link to person if we can
  if (person.u[1]) {
    return '<a href="' + this.getPersonUrl(person) + '">' + this.getPersonName(person) + '</a>';
  } else {
    return this.getPersonName(person);
  };
};

// *** Session/Local Storage ***

// Use a do-nothing wrapper object as a proxy for
// sessionStorage and localStorage if they are not
// available
function storageNoOp() {};
storageNoOp.prototype.getItem = function(name) {
  return "";
};
storageNoOp.prototype.setItem = function(name, value) {
  return value;
};

function StorageMethod() {
  // This class determines the first storage method that
  // works in this sequence: session, local, none
  // When used from a "file:" page, the object may exist
  // but not work, so testing functionality is required,
  // and we have to use try/catch. try/catch is expensive,
  // so instantiate the class once, then use StorageMethod.obj
  // to store values, or cache StorageMethod.obj in a var
  // and use the var.

  function testStorage(oStorage) {
    var kNameValue = "xyzzy";
    try {
      oStorage.setItem(kNameValue, kNameValue);
      return (oStorage.getItem(kNameValue) === kNameValue);
    } catch (e) {
      return false;
    };
  };

  try {
    this.method = "session";
    if (testStorage(sessionStorage)) {
      this.obj = sessionStorage;
    } else {
      throw false;
    };
  } catch(e) {
    try {
      this.method = "local";
      if(testStorage(localStorage)) {
        this.obj = localStorage;
      } else {
        throw false;
      };
    } catch(e) {
      var noOp = new storageNoOp();
      this.method = "no-op";
      this.obj = noOp;
    };
  };
};

function initFex() {
  // initFex() installs handlers for Family Explorer buttons
  $(".sect-fex").show();
  $(".fex-open").click( toggleFex ).show();
  $('body').append('<div id="fex"/>');
  $("#fex").on("click", ".fex-close", function(e){
    $(this).parent().hide();
  });
};

function toggleFex(e) {
  var $button = $(e.currentTarget);
  var personId = $button.attr('id').replace(/fex/i, '');
  var $fexContainer = $('#fexp' + personId);

  if ($fexContainer.is(":visible")) {
    $fexContainer.hide();
  } else {
    showFex(e);
  };
  e.preventDefault();
};

function showFex(e) {
  var $button = $(e.currentTarget);
  var personId = $button.attr('id').replace(/fex/i, '');

  var sOut = getFexPrefix(personId);
  sOut += fexWalkTree(personId, 0, 1);
  sOut += '</div>';

  // Add the new HTML to the fe element,
  // move it relative to button, and show it.
  var pos = $button.offset();
  $('#fex').html(sOut).css({left: pos.left+'px', top: (pos.top+$button.outerHeight()+1)+'px'})
      .show()
      .find('.fex-close').focus().end();
};

function fexWalkTree(id, generation, slot) {
  var sOut = '';

  var oPerson = famexp_data.people[id];
  if (oPerson) {
    if (slot==1) {
      sOut += getFexSiblings(oPerson);
      sOut += getFexPartners(oPerson);
    };

    sOut += getFexPerson(oPerson, slot);

    if (generation<3) {
      sOut += fexWalkTree((oPerson.f || 0), generation+1, slot*2);
      sOut += fexWalkTree((oPerson.m || 0), generation+1, (slot*2)+1);
    };

  } else {
    sOut += getFexDummy(slot);
    if (generation<3) {
      sOut += fexWalkTree(0, generation+1, slot*2);
      sOut += fexWalkTree(0, generation+1, (slot*2)+1);
    };
  };
  return sOut;
};

function getFexPerson(oPerson, slot) {
  var sClassSuffix = oPerson.g;
  if (slot == 1) sClassSuffix += ' fexci-subject';
  var sOut = '<div class="fexci fexci' + slot + ' fexci-' + sClassSuffix + '">';

  sOut += '<span class="fexci-name">';
  if (slot == 1) {
    sOut += famexp_data.getPersonName(oPerson);
  } else {
    sOut += famexp_data.getPersonLink(oPerson);
  };
  sOut += '</span>';

  if (oPerson.u[3] || oPerson.u[4]) {
    sOut += '<span class="fexci-date">';
    if (oPerson.u[3]) sOut += (famexp_data.baseYear-oPerson.u[3]);
    sOut += ' - ';
    if (oPerson.u[4]) sOut += (famexp_data.baseYear-oPerson.u[4]);
    sOut += '</span>';
  };
  sOut += '</div>';
  return sOut;
};

function getFexDummy(slot) {
  return '<div class="fexci fexci' + slot + ' fexci-u"></div>';
};

function getFexReference(id, classPrefix, genderDefault) {
  var sClassSuffix = '';
  var sOut = '';

  var oPerson = famexp_data.people[id];
  if (oPerson) {
    sClassSuffix = oPerson.g;
    sOut += '<span class="' + classPrefix + sClassSuffix + '">';
    sOut += famexp_data.getPersonLink(oPerson);
    sOut += '</span>';
  } else {
    sClassSuffix = genderDefault;
    sOut += '<span class="' + classPrefix + sClassSuffix + '">?</span>';
  };
  return sOut;
};

function getFexPartners(oPerson) {
  var sOut = '';
  var aFamilies = oPerson.pc;
  var sHeading = famexp_data.oOptions.childrenHeading;

  if (aFamilies && aFamilies.length > 0) {
    sOut += '<div class="fexsd fexsd-b"><ul><li><span class="fexsd-title">' + sHeading + '</span><ul>';
    for (var iFamily = 0; iFamily < aFamilies.length; iFamily++) {
      var aFamily = aFamilies[iFamily];
      sOut += '<li>' + getFexReference(aFamily[0], 'fexsd-spouse-', (oPerson.g=='m' ? 'f' : 'm'));
      sOut += '<ul>';
      for (var iChild = 1; iChild < aFamily.length; iChild++) {
        sOut += '<li>' + getFexReference(aFamily[iChild], 'fexsd-child-', 'm') + '</li>';
      };
      sOut += '</ul></li>';
    };
    sOut += '</ul></li></ul></div>';
  };
  return sOut;
};

function getFexSiblings(oPerson) {
  var sOut = '';
  var aSiblings = oPerson.sib;
  var sHeading = famexp_data.oOptions.siblingHeading;

  if (aSiblings && aSiblings.length > 0) {

    sOut += '<div class="fexsd fexsd-a"><ul><li><span class="fexsd-title">' + sHeading + '</span><ul>';
    for (var iSibling = 0; iSibling < aSiblings.length; iSibling++) {
      sOut += '<li>' + getFexReference(aSiblings[iSibling], 'fexsd-sibling-', 'm') + '</li>';
    };
    sOut += '</ul></li></ul></div>';
  };
  return sOut;
};

function getFexPrefix(personID) {
  var sOut = '<div class="fex-container" id="fexp' + personID + '">';
  sOut += '<button class="fex-close"/>';
  sOut += '<div class="fexsd-horz-line fexsd-horz-line1"/>';
  sOut += '<div class="fexsd-cupl-line fexsd-cupl-line23"/>';
  sOut += '<div class="fexsd-cupl-line fexsd-cupl-line45"/>';
  sOut += '<div class="fexsd-cupl-line fexsd-cupl-line67"/>';
  sOut += '<div class="fexsd-cupl-line fexsd-cupl-line89"/>';
  sOut += '<div class="fexsd-cupl-line fexsd-cupl-line1011"/>';
  sOut += '<div class="fexsd-cupl-line fexsd-cupl-line1213"/>';
  sOut += '<div class="fexsd-cupl-line fexsd-cupl-line1415"/>';
  sOut += '<div class="fexsd-horz-line fexsd-horz-line89"/>';
  sOut += '<div class="fexsd-horz-line fexsd-horz-line1011"/>';
  sOut += '<div class="fexsd-horz-line fexsd-horz-line1213"/>';
  sOut += '<div class="fexsd-horz-line fexsd-horz-line1415"/>';
  return sOut;
};
/*!
 * jQuery hashchange event - v1.3 - 9/03/2013
 * http://benalman.com/projects/jquery-hashchange-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
//# sourceMappingURL=jquery.ba-hashchange.map
(function($,window,undefined){"$:nomunge";var str_hashchange="hashchange",doc=document,fake_onhashchange,special=$.event.special,doc_mode=doc.documentMode,supports_onhashchange="on"+str_hashchange in window&&(doc_mode===undefined||doc_mode>7);function get_fragment(url){url=url||location.href;return"#"+url.replace(/^[^#]*#?(.*)$/,"$1")}$.fn[str_hashchange]=function(fn){return fn?this.bind(str_hashchange,fn):this.trigger(str_hashchange)};$.fn[str_hashchange].delay=50;special[str_hashchange]=$.extend(special[str_hashchange],{setup:function(){if(supports_onhashchange){return false}$(fake_onhashchange.start)},teardown:function(){if(supports_onhashchange){return false}$(fake_onhashchange.stop)}});fake_onhashchange=function(){var self={},timeout_id,last_hash=get_fragment(),fn_retval=function(val){return val},history_set=fn_retval,history_get=fn_retval;self.start=function(){timeout_id||poll()};self.stop=function(){timeout_id&&clearTimeout(timeout_id);timeout_id=undefined};function poll(){var hash=get_fragment(),history_hash=history_get(last_hash);if(hash!==last_hash){history_set(last_hash=hash,history_hash);$(window).trigger(str_hashchange)}else if(history_hash!==last_hash){location.href=location.href.replace(/#.*/,"")+history_hash}timeout_id=setTimeout(poll,$.fn[str_hashchange].delay)}!supports_onhashchange&&function(){if(!/MSIE/.test(navigator.userAgent)){return false}var iframe,iframe_src;self.start=function(){if(!iframe){iframe_src=$.fn[str_hashchange].src;iframe_src=iframe_src&&iframe_src+get_fragment();iframe=$('<iframe tabindex="-1" title="empty"/>').hide().one("load",function(){iframe_src||history_set(get_fragment());poll()}).attr("src",iframe_src||"javascript:0").insertAfter("body")[0].contentWindow;doc.onpropertychange=function(){try{if(event.propertyName==="title"){iframe.document.title=doc.title}}catch(e){}}}};self.stop=fn_retval;history_get=function(){return get_fragment(iframe.location.href)};history_set=function(hash,history_hash){var iframe_doc=iframe.document,domain=$.fn[str_hashchange].domain;if(hash!==history_hash){iframe_doc.title=doc.title;iframe_doc.open();domain&&iframe_doc.write('<script>document.domain="'+domain+'"</script>');iframe_doc.close();iframe.location.hash=hash}}}();return self}()})(jQuery,this);
/*!
 * jQuery clueTip plugin v1.2.5
 *
 * Date: Sat Feb 04 22:52:27 2012 EST
 * Requires: jQuery v1.3+
 *
 * Copyright 2011, Karl Swedberg
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 *
 * Examples can be found at http://plugins.learningjquery.com/cluetip/demo/
 *
*/
(function(c){c.cluetip={version:"1.2.5",template:'<div><div class="cluetip-outer"><h3 class="cluetip-title ui-widget-header ui-cluetip-header"></h3><div class="cluetip-inner ui-widget-content ui-cluetip-content"></div></div><div class="cluetip-extra"></div><div class="cluetip-arrows ui-state-default"></div></div>',setup:{insertionType:"appendTo",insertionElement:"body"},defaults:{multiple:false,width:275,height:"auto",cluezIndex:97,positionBy:"auto",topOffset:15,leftOffset:15,local:false,localPrefix:null,
localIdSuffix:null,hideLocal:true,attribute:"rel",titleAttribute:"title",splitTitle:"",escapeTitle:false,showTitle:true,cluetipClass:"default",hoverClass:"",waitImage:true,cursor:"help",arrows:false,dropShadow:true,dropShadowSteps:6,sticky:false,mouseOutClose:false,activation:"hover",clickThrough:true,tracking:false,delayedClose:0,closePosition:"top",closeText:"Close",truncate:0,fx:{open:"show",openSpeed:""},hoverIntent:{sensitivity:3,interval:50,timeout:0},onActivate:function(){return true},onShow:function(){},
onHide:function(){},ajaxCache:true,ajaxProcess:function(j){return j=j.replace(/<(script|style|title)[^<]+<\/(script|style|title)>/gm,"").replace(/<(link|meta)[^>]+>/g,"")},ajaxSettings:{dataType:"html"},debug:false}};var C,K={},ha=0,Q=0;c.fn.attrProp=c.fn.prop||c.fn.attr;c.fn.cluetip=function(j,q){function R(S,s,n){n="";s=s.dropShadow&&s.dropShadowSteps?+s.dropShadowSteps:0;if(c.support.boxShadow){if(s)n="1px 1px "+s+"px rgba(0,0,0,0.5)";S.css(c.support.boxShadow,n);return false}n=S.find(".cluetip-drop-shadow");
if(s==n.length)return n;n.remove();n=[];for(var k=0;k<s;)n[k++]='<div style="top:'+k+"px;left:"+k+'px;"></div>';return n=c(n.join("")).css({position:"absolute",backgroundColor:"#000",zIndex:T-1,opacity:0.1}).addClass("cluetip-drop-shadow").prependTo(S)}var d,h,r,D,t,U;if(typeof j=="object"){q=j;j=null}if(j=="destroy"){var V=this.data("cluetip");if(V){c(V.selector).remove();c.removeData(this,"title");c.removeData(this,"cluetip");c(document).unbind(".cluetip");return this.unbind(".cluetip")}}q=c.extend(true,
{},c.cluetip.defaults,q||{});ha++;var T;V=c.cluetip.backCompat||!q.multiple?"cluetip":"cluetip-"+ha;var da="#"+V,w=c.cluetip.backCompat?"#":".",Y=c.cluetip.setup.insertionType,ma=c.cluetip.setup.insertionElement||"body";Y=/appendTo|prependTo|insertBefore|insertAfter/.test(Y)?Y:"appendTo";d=c(da);if(!d.length){d=c(c.cluetip.template)[Y](ma).attr("id",V).css({position:"absolute",display:"none"});T=+q.cluezIndex;r=d.find(w+"cluetip-outer").css({position:"relative",zIndex:T});h=d.find(w+"cluetip-inner");
D=d.find(w+"cluetip-title")}C=c("#cluetip-waitimage");C.length||(C=c("<div></div>").attr("id","cluetip-waitimage").css({position:"absolute"}));C.insertBefore(d).hide();var na=(parseInt(d.css("paddingLeft"),10)||0)+(parseInt(d.css("paddingRight"),10)||0);this.each(function(S){function s(){return false}function n(b,f){var g=b.status;f.beforeSend(b.xhr,f);if(g=="error")f[g](b.xhr,b.textStatus);else g=="success"&&f[g](b.data,b.textStatus,b.xhr);f.complete(b.xhr,f.textStatus)}var k=this,e=c(this),a=c.extend(true,
{},q,c.metadata?e.metadata():c.meta?e.data():e.data("cluetip")||{}),G=false,L=false,ia=0,i=a[a.attribute]||e.attrProp(a.attribute)||e.attr(a.attribute),W=a.cluetipClass;T=+a.cluezIndex;e.data("cluetip",{title:k.title,zIndex:T,selector:da});if(!i&&!a.splitTitle&&!j)return true;if(a.local&&a.localPrefix)i=a.localPrefix+i;a.local&&a.hideLocal&&i&&c(i+":first").hide();var u=parseInt(a.topOffset,10),E=parseInt(a.leftOffset,10),F,ea,Z=isNaN(parseInt(a.height,10))?"auto":/\D/g.test(a.height)?a.height:a.height+
"px",$,x,y,M,aa,fa=parseInt(a.width,10)||275,o=fa+na+a.dropShadowSteps,H=this.offsetWidth,z,l,p,N,I,A=a.attribute!="title"?e.attrProp(a.titleAttribute)||"":"";if(a.splitTitle){I=A.split(a.splitTitle);A=a.showTitle||I[0]===""?I.shift():""}if(a.escapeTitle)A=A.replace(/&/g,"&amp;").replace(/>/g,"&gt;").replace(/</g,"&lt;");var ba=function(b){var f;if(a.onActivate(e)===false)return false;L=true;d=c(da).css({position:"absolute"});r=d.find(w+"cluetip-outer");h=d.find(w+"cluetip-inner");D=d.find(w+"cluetip-title");
t=d.find(w+"cluetip-arrows");d.removeClass().css({width:fa});i==e.attr("href")&&e.css("cursor",a.cursor);a.hoverClass&&e.addClass(a.hoverClass);x=e.offset().top;z=e.offset().left;H=e.innerWidth();if(b.type==focus){p=z+H/2+E;d.css({left:l});M=x+u}else{p=b.pageX;M=b.pageY}if(k.tagName.toLowerCase()!="area"){$=c(document).scrollTop();N=c(window).width()}if(a.positionBy=="fixed"){l=H+z+E;d.css({left:l})}else{l=H>z&&z>o||z+H+o+E>N?z-o-E:H+z+E;if(k.tagName.toLowerCase()=="area"||a.positionBy=="mouse"||
H+o>N)if(p+20+o>N){d.addClass("cluetip-"+W);l=p-o-E>=0?p-o-E-parseInt(d.css("marginLeft"),10)+parseInt(h.css("marginRight"),10):p-o/2}else l=p+E;f=l<0?b.pageY+u:b.pageY;if(l<0||a.positionBy=="bottomTop")l=p+o/2>N?N/2-o/2:Math.max(p-o/2,0)}t.css({zIndex:e.data("cluetip").zIndex+1});d.css({left:l,zIndex:e.data("cluetip").zIndex});ea=c(window).height();if(j){if(typeof j=="function")j=j.call(k);h.html(j);O(f)}else if(I){b=I.length;h.html(b?I[0]:"");if(b>1)for(var g=1;g<b;g++)h.append('<div class="split-body">'+
I[g]+"</div>");O(f)}else if(!a.local&&i.indexOf("#")!==0)if(/\.(jpe?g|tiff?|gif|png)(?:\?.*)?$/i.test(i)){h.html('<img src="'+i+'" alt="'+A+'" />');O(f)}else{var m=a.ajaxSettings.beforeSend,P=a.ajaxSettings.error,ja=a.ajaxSettings.success,ka=a.ajaxSettings.complete;b=c.extend(true,{},a.ajaxSettings,{cache:a.ajaxCache,url:i,beforeSend:function(v,B){m&&m.call(k,v,d,h,B);r.children().empty();a.waitImage&&C.css({top:M+20,left:p+20,zIndex:e.data("cluetip").zIndex-1}).show()},error:function(v,B){if(q.ajaxCache&&
!K[i])K[i]={status:"error",textStatus:B,xhr:v};if(L)P?P.call(k,v,B,d,h):h.html("<i>sorry, the contents could not be loaded</i>")},success:function(v,B,J){if(q.ajaxCache&&!K[i])K[i]={status:"success",data:v,textStatus:B,xhr:J};G=a.ajaxProcess.call(k,v);if(typeof G=="object"&&G!==null){A=G.title;G=G.content}if(L){ja&&ja.call(k,v,B,d,h);h.html(G)}},complete:function(v,B){ka&&ka.call(k,v,B,d,h);var J=h[0].getElementsByTagName("img");Q=J.length;for(var ga=0,oa=J.length;ga<oa;ga++)J[ga].complete&&Q--;if(Q&&
!c.browser.opera)c(J).bind("load.ct error.ct",function(){Q--;if(Q===0){C.hide();c(J).unbind(".ct");L&&O(f)}});else{C.hide();L&&O(f)}}});K[i]?n(K[i],b):c.ajax(b)}else if(a.local){b=c(i+(/^#\S+$/.test(i)?"":":eq("+S+")")).clone(true).show();a.localIdSuffix&&b.attr("id",b[0].id+a.localIdSuffix);h.html(b);O(f)}},O=function(b){var f,g;f=A||a.showTitle&&"&nbsp;";var m="";g="";d.addClass("cluetip-"+W);if(a.truncate){var P=h.text().slice(0,a.truncate)+"...";h.html(P)}f?D.show().html(f):D.hide();if(a.sticky){f=
c('<div class="cluetip-close"><a href="#">'+a.closeText+"</a></div>");a.closePosition=="bottom"?f.appendTo(h):a.closePosition=="title"?f.prependTo(D):f.prependTo(h);f.bind("click.cluetip",function(){X();return false});a.mouseOutClose?d.bind("mouseleave.cluetip",function(){X()}):d.unbind("mouseleave.cluetip")}r.css({zIndex:e.data("cluetip").zIndex,overflow:Z=="auto"?"visible":"auto",height:Z});F=Z=="auto"?Math.max(d.outerHeight(),d.height()):parseInt(Z,10);y=x;aa=$+ea;if(a.positionBy=="fixed")y=x-
a.dropShadowSteps+u;else if(l<p&&Math.max(l,0)+o>p||a.positionBy=="bottomTop")if(x+F+u>aa&&M-$>F+u){y=M-F-u;g="top"}else{y=M+u;g="bottom"}else y=x+F+u>aa?F>=ea?$:aa-F-u:e.css("display")=="block"||k.tagName.toLowerCase()=="area"||a.positionBy=="mouse"?b-u:x-a.dropShadowSteps;if(g==="")g=l<z?"left":"right";f=" clue-"+g+"-"+W+" cluetip-"+W;if(W=="rounded")f+=" ui-corner-all";d.css({top:y+"px"}).attrProp({className:"cluetip ui-widget ui-widget-content ui-cluetip"+f});if(a.arrows){if(/(left|right)/.test(g)){g=
d.height()-t.height();m=l>=0&&b>0?x-y-a.dropShadowSteps:0;m=g>m?m:g;m+="px"}t.css({top:m}).show()}else t.hide();(U=R(d,a))&&U.length&&U.hide().css({height:F,width:fa,zIndex:e.data("cluetip").zIndex-1}).show();d.hide()[a.fx.open](a.fx.openSpeed||0);c.fn.bgiframe&&d.bgiframe();if(a.delayedClose>0)ia=setTimeout(X,a.delayedClose);a.onShow.call(k,d,h)},ca=function(){L=false;C.hide();if(!a.sticky||/click|toggle/.test(a.activation)){X();clearTimeout(ia)}a.hoverClass&&e.removeClass(a.hoverClass)},X=function(b){b=
b&&b.data("cluetip")?b:e;var f=b.data("cluetip")&&b.data("cluetip").selector,g=c(f||"div.cluetip"),m=g.find(w+"cluetip-inner"),P=g.find(w+"cluetip-arrows");g.hide().removeClass();a.onHide.call(b[0],g,m);if(f){b.removeClass("cluetip-clicked");b.css("cursor","")}f&&A&&b.attrProp(a.titleAttribute,A);a.arrows&&P.css({top:""})};c(document).unbind("hideCluetip.cluetip").bind("hideCluetip.cluetip",function(b){X(c(b.target))});if(/click|toggle/.test(a.activation))e.bind("click.cluetip",function(b){if(d.is(":hidden")||
!e.is(".cluetip-clicked")){ba(b);c(".cluetip-clicked").removeClass("cluetip-clicked");e.addClass("cluetip-clicked")}else ca(b);return false});else if(a.activation=="focus"){e.bind("focus.cluetip",function(b){e.attrProp("title","");ba(b)});e.bind("blur.cluetip",function(b){e.attrProp("title",e.data("cluetip").title);ca(b)})}else{e[a.clickThrough?"unbind":"bind"]("click.cluetip",s);var la=function(b){if(a.tracking){var f=l-b.pageX,g=y?y-b.pageY:x-b.pageY;e.bind("mousemove.cluetip",function(m){d.css({left:m.pageX+
f,top:m.pageY+g})})}};c.fn.hoverIntent&&a.hoverIntent?e.hoverIntent({sensitivity:a.hoverIntent.sensitivity,interval:a.hoverIntent.interval,over:function(b){ba(b);la(b)},timeout:a.hoverIntent.timeout,out:function(b){ca(b);e.unbind("mousemove.cluetip")}}):e.bind("mouseenter.cluetip",function(b){ba(b);la(b)}).bind("mouseleave.cluetip",function(b){ca(b);e.unbind("mousemove.cluetip")});e.bind("mouseover.cluetip",function(){e.attrProp("title","")}).bind("mouseleave.cluetip",function(){e.attrProp("title",
e.data("cluetip").title)})}});return this};(function(){c.support=c.support||{};for(var j=document.createElement("div").style,q=["boxShadow"],R=["moz","Moz","webkit","o"],d=0,h=q.length;d<h;d++){var r=q[d],D=r.charAt(0).toUpperCase()+r.slice(1);if(typeof j[r]!=="undefined")c.support[r]=r;else for(var t=0,U=R.length;t<U;t++)if(typeof j[R[t]+D]!=="undefined"){c.support[r]=R[t]+D;break}}})();c.fn.cluetip.defaults=c.cluetip.defaults})(jQuery);
/*
 * jQuery Cycle Plugin (with Transition Definitions)
 * Examples and documentation at: http://jquery.malsup.com/cycle/
 * Copyright (c) 2007-2013 M. Alsup
 * Version: 3.0.3 (11-JUL-2013)
 * Dual licensed under the MIT and GPL licenses.
 * http://jquery.malsup.com/license.html
 * Requires: jQuery v1.7.1 or later
 */
(function($,undefined){var ver="3.0.3";function debug(s){if($.fn.cycle.debug){log(s);}}function log(){if(window.console&&console.log){console.log("[cycle] "+Array.prototype.join.call(arguments," "));}}$.expr[":"].paused=function(el){return el.cyclePause;};$.fn.cycle=function(options,arg2){var o={s:this.selector,c:this.context};if(this.length===0&&options!="stop"){if(!$.isReady&&o.s){log("DOM not ready, queuing slideshow");$(function(){$(o.s,o.c).cycle(options,arg2);});return this;}log("terminating; zero elements found by selector"+($.isReady?"":" (DOM not ready)"));return this;}return this.each(function(){var opts=handleArguments(this,options,arg2);if(opts===false){return;}opts.updateActivePagerLink=opts.updateActivePagerLink||$.fn.cycle.updateActivePagerLink;if(this.cycleTimeout){clearTimeout(this.cycleTimeout);}this.cycleTimeout=this.cyclePause=0;this.cycleStop=0;var $cont=$(this);var $slides=opts.slideExpr?$(opts.slideExpr,this):$cont.children();var els=$slides.get();if(els.length<2){log("terminating; too few slides: "+els.length);return;}var opts2=buildOptions($cont,$slides,els,opts,o);if(opts2===false){return;}var startTime=opts2.continuous?10:getTimeout(els[opts2.currSlide],els[opts2.nextSlide],opts2,!opts2.backwards);if(startTime){startTime+=(opts2.delay||0);if(startTime<10){startTime=10;}debug("first timeout: "+startTime);this.cycleTimeout=setTimeout(function(){go(els,opts2,0,!opts.backwards);},startTime);}});};function triggerPause(cont,byHover,onPager){var opts=$(cont).data("cycle.opts");if(!opts){return;}var paused=!!cont.cyclePause;if(paused&&opts.paused){opts.paused(cont,opts,byHover,onPager);}else{if(!paused&&opts.resumed){opts.resumed(cont,opts,byHover,onPager);}}}function handleArguments(cont,options,arg2){if(cont.cycleStop===undefined){cont.cycleStop=0;}if(options===undefined||options===null){options={};}if(options.constructor==String){switch(options){case"destroy":case"stop":var opts=$(cont).data("cycle.opts");if(!opts){return false;}cont.cycleStop++;if(cont.cycleTimeout){clearTimeout(cont.cycleTimeout);}cont.cycleTimeout=0;if(opts.elements){$(opts.elements).stop();}$(cont).removeData("cycle.opts");if(options=="destroy"){destroy(cont,opts);}return false;case"toggle":cont.cyclePause=(cont.cyclePause===1)?0:1;checkInstantResume(cont.cyclePause,arg2,cont);triggerPause(cont);return false;case"pause":cont.cyclePause=1;triggerPause(cont);return false;case"resume":cont.cyclePause=0;checkInstantResume(false,arg2,cont);triggerPause(cont);return false;case"prev":case"next":opts=$(cont).data("cycle.opts");if(!opts){log('options not found, "prev/next" ignored');return false;}if(typeof arg2=="string"){opts.oneTimeFx=arg2;}$.fn.cycle[options](opts);return false;default:options={fx:options};}return options;}else{if(options.constructor==Number){var num=options;options=$(cont).data("cycle.opts");if(!options){log("options not found, can not advance slide");return false;}if(num<0||num>=options.elements.length){log("invalid slide index: "+num);return false;}options.nextSlide=num;if(cont.cycleTimeout){clearTimeout(cont.cycleTimeout);cont.cycleTimeout=0;}if(typeof arg2=="string"){options.oneTimeFx=arg2;}go(options.elements,options,1,num>=options.currSlide);return false;}}return options;function checkInstantResume(isPaused,arg2,cont){if(!isPaused&&arg2===true){var options=$(cont).data("cycle.opts");if(!options){log("options not found, can not resume");return false;}if(cont.cycleTimeout){clearTimeout(cont.cycleTimeout);cont.cycleTimeout=0;}go(options.elements,options,1,!options.backwards);}}}function removeFilter(el,opts){if(!$.support.opacity&&opts.cleartype&&el.style.filter){try{el.style.removeAttribute("filter");}catch(smother){}}}function destroy(cont,opts){if(opts.next){$(opts.next).unbind(opts.prevNextEvent);}if(opts.prev){$(opts.prev).unbind(opts.prevNextEvent);}if(opts.pager||opts.pagerAnchorBuilder){$.each(opts.pagerAnchors||[],function(){this.unbind().remove();});}opts.pagerAnchors=null;$(cont).unbind("mouseenter.cycle mouseleave.cycle");if(opts.destroy){opts.destroy(opts);}}function buildOptions($cont,$slides,els,options,o){var startingSlideSpecified;var opts=$.extend({},$.fn.cycle.defaults,options||{},$.metadata?$cont.metadata():$.meta?$cont.data():{});var meta=$.isFunction($cont.data)?$cont.data(opts.metaAttr):null;if(meta){opts=$.extend(opts,meta);}if(opts.autostop){opts.countdown=opts.autostopCount||els.length;}var cont=$cont[0];$cont.data("cycle.opts",opts);opts.$cont=$cont;opts.stopCount=cont.cycleStop;opts.elements=els;opts.before=opts.before?[opts.before]:[];opts.after=opts.after?[opts.after]:[];if(!$.support.opacity&&opts.cleartype){opts.after.push(function(){removeFilter(this,opts);});}if(opts.continuous){opts.after.push(function(){go(els,opts,0,!opts.backwards);});}saveOriginalOpts(opts);if(!$.support.opacity&&opts.cleartype&&!opts.cleartypeNoBg){clearTypeFix($slides);}if($cont.css("position")=="static"){$cont.css("position","relative");}if(opts.width){$cont.width(opts.width);}if(opts.height&&opts.height!="auto"){$cont.height(opts.height);}if(opts.startingSlide!==undefined){opts.startingSlide=parseInt(opts.startingSlide,10);if(opts.startingSlide>=els.length||opts.startSlide<0){opts.startingSlide=0;}else{startingSlideSpecified=true;}}else{if(opts.backwards){opts.startingSlide=els.length-1;}else{opts.startingSlide=0;}}if(opts.random){opts.randomMap=[];for(var i=0;i<els.length;i++){opts.randomMap.push(i);}opts.randomMap.sort(function(a,b){return Math.random()-0.5;});if(startingSlideSpecified){for(var cnt=0;cnt<els.length;cnt++){if(opts.startingSlide==opts.randomMap[cnt]){opts.randomIndex=cnt;}}}else{opts.randomIndex=1;opts.startingSlide=opts.randomMap[1];}}else{if(opts.startingSlide>=els.length){opts.startingSlide=0;}}opts.currSlide=opts.startingSlide||0;var first=opts.startingSlide;$slides.css({position:"absolute",top:0,left:0}).hide().each(function(i){var z;if(opts.backwards){z=first?i<=first?els.length+(i-first):first-i:els.length-i;}else{z=first?i>=first?els.length-(i-first):first-i:els.length-i;}$(this).css("z-index",z);});$(els[first]).css("opacity",1).show();removeFilter(els[first],opts);if(opts.fit){if(!opts.aspect){if(opts.width){$slides.width(opts.width);}if(opts.height&&opts.height!="auto"){$slides.height(opts.height);}}else{$slides.each(function(){var $slide=$(this);var ratio=(opts.aspect===true)?$slide.width()/$slide.height():opts.aspect;if(opts.width&&$slide.width()!=opts.width){$slide.width(opts.width);$slide.height(opts.width/ratio);}if(opts.height&&$slide.height()<opts.height){$slide.height(opts.height);$slide.width(opts.height*ratio);}});}}if(opts.center&&((!opts.fit)||opts.aspect)){$slides.each(function(){var $slide=$(this);$slide.css({"margin-left":opts.width?((opts.width-$slide.width())/2)+"px":0,"margin-top":opts.height?((opts.height-$slide.height())/2)+"px":0});});}if(opts.center&&!opts.fit&&!opts.slideResize){$slides.each(function(){var $slide=$(this);$slide.css({"margin-left":opts.width?((opts.width-$slide.width())/2)+"px":0,"margin-top":opts.height?((opts.height-$slide.height())/2)+"px":0});});}var reshape=(opts.containerResize||opts.containerResizeHeight)&&$cont.innerHeight()<1;if(reshape){var maxw=0,maxh=0;for(var j=0;j<els.length;j++){var $e=$(els[j]),e=$e[0],w=$e.outerWidth(),h=$e.outerHeight();if(!w){w=e.offsetWidth||e.width||$e.attr("width");}if(!h){h=e.offsetHeight||e.height||$e.attr("height");}maxw=w>maxw?w:maxw;maxh=h>maxh?h:maxh;}if(opts.containerResize&&maxw>0&&maxh>0){$cont.css({width:maxw+"px",height:maxh+"px"});}if(opts.containerResizeHeight&&maxh>0){$cont.css({height:maxh+"px"});}}var pauseFlag=false;if(opts.pause){$cont.bind("mouseenter.cycle",function(){pauseFlag=true;this.cyclePause++;triggerPause(cont,true);}).bind("mouseleave.cycle",function(){if(pauseFlag){this.cyclePause--;}triggerPause(cont,true);});}if(supportMultiTransitions(opts)===false){return false;}var requeue=false;options.requeueAttempts=options.requeueAttempts||0;$slides.each(function(){var $el=$(this);this.cycleH=(opts.fit&&opts.height)?opts.height:($el.height()||this.offsetHeight||this.height||$el.attr("height")||0);this.cycleW=(opts.fit&&opts.width)?opts.width:($el.width()||this.offsetWidth||this.width||$el.attr("width")||0);if($el.is("img")){var loading=(this.cycleH===0&&this.cycleW===0&&!this.complete);if(loading){if(o.s&&opts.requeueOnImageNotLoaded&&++options.requeueAttempts<100){log(options.requeueAttempts," - img slide not loaded, requeuing slideshow: ",this.src,this.cycleW,this.cycleH);setTimeout(function(){$(o.s,o.c).cycle(options);},opts.requeueTimeout);requeue=true;return false;}else{log("could not determine size of image: "+this.src,this.cycleW,this.cycleH);}}}return true;});if(requeue){return false;}opts.cssBefore=opts.cssBefore||{};opts.cssAfter=opts.cssAfter||{};opts.cssFirst=opts.cssFirst||{};opts.animIn=opts.animIn||{};opts.animOut=opts.animOut||{};$slides.not(":eq("+first+")").css(opts.cssBefore);$($slides[first]).css(opts.cssFirst);if(opts.timeout){opts.timeout=parseInt(opts.timeout,10);if(opts.speed.constructor==String){opts.speed=$.fx.speeds[opts.speed]||parseInt(opts.speed,10);}if(!opts.sync){opts.speed=opts.speed/2;}var buffer=opts.fx=="none"?0:opts.fx=="shuffle"?500:250;while((opts.timeout-opts.speed)<buffer){opts.timeout+=opts.speed;}}if(opts.easing){opts.easeIn=opts.easeOut=opts.easing;}if(!opts.speedIn){opts.speedIn=opts.speed;}if(!opts.speedOut){opts.speedOut=opts.speed;}opts.slideCount=els.length;opts.currSlide=opts.lastSlide=first;if(opts.random){if(++opts.randomIndex==els.length){opts.randomIndex=0;}opts.nextSlide=opts.randomMap[opts.randomIndex];}else{if(opts.backwards){opts.nextSlide=opts.startingSlide===0?(els.length-1):opts.startingSlide-1;}else{opts.nextSlide=opts.startingSlide>=(els.length-1)?0:opts.startingSlide+1;}}if(!opts.multiFx){var init=$.fn.cycle.transitions[opts.fx];if($.isFunction(init)){init($cont,$slides,opts);}else{if(opts.fx!="custom"&&!opts.multiFx){log("unknown transition: "+opts.fx,"; slideshow terminating");return false;}}}var e0=$slides[first];if(!opts.skipInitializationCallbacks){if(opts.before.length){opts.before[0].apply(e0,[e0,e0,opts,true]);}if(opts.after.length){opts.after[0].apply(e0,[e0,e0,opts,true]);}}if(opts.next){$(opts.next).bind(opts.prevNextEvent,function(){return advance(opts,1);});}if(opts.prev){$(opts.prev).bind(opts.prevNextEvent,function(){return advance(opts,0);});}if(opts.pager||opts.pagerAnchorBuilder){buildPager(els,opts);}exposeAddSlide(opts,els);return opts;}function saveOriginalOpts(opts){opts.original={before:[],after:[]};opts.original.cssBefore=$.extend({},opts.cssBefore);opts.original.cssAfter=$.extend({},opts.cssAfter);opts.original.animIn=$.extend({},opts.animIn);opts.original.animOut=$.extend({},opts.animOut);$.each(opts.before,function(){opts.original.before.push(this);});$.each(opts.after,function(){opts.original.after.push(this);});}function supportMultiTransitions(opts){var i,tx,txs=$.fn.cycle.transitions;if(opts.fx.indexOf(",")>0){opts.multiFx=true;opts.fxs=opts.fx.replace(/\s*/g,"").split(",");for(i=0;i<opts.fxs.length;i++){var fx=opts.fxs[i];tx=txs[fx];if(!tx||!txs.hasOwnProperty(fx)||!$.isFunction(tx)){log("discarding unknown transition: ",fx);opts.fxs.splice(i,1);i--;}}if(!opts.fxs.length){log("No valid transitions named; slideshow terminating.");return false;}}else{if(opts.fx=="all"){opts.multiFx=true;opts.fxs=[];for(var p in txs){if(txs.hasOwnProperty(p)){tx=txs[p];if(txs.hasOwnProperty(p)&&$.isFunction(tx)){opts.fxs.push(p);}}}}}if(opts.multiFx&&opts.randomizeEffects){var r1=Math.floor(Math.random()*20)+30;for(i=0;i<r1;i++){var r2=Math.floor(Math.random()*opts.fxs.length);opts.fxs.push(opts.fxs.splice(r2,1)[0]);}debug("randomized fx sequence: ",opts.fxs);}return true;}function exposeAddSlide(opts,els){opts.addSlide=function(newSlide,prepend){var $s=$(newSlide),s=$s[0];if(!opts.autostopCount){opts.countdown++;}els[prepend?"unshift":"push"](s);if(opts.els){opts.els[prepend?"unshift":"push"](s);}opts.slideCount=els.length;if(opts.random){opts.randomMap.push(opts.slideCount-1);opts.randomMap.sort(function(a,b){return Math.random()-0.5;});}$s.css("position","absolute");$s[prepend?"prependTo":"appendTo"](opts.$cont);if(prepend){opts.currSlide++;opts.nextSlide++;}if(!$.support.opacity&&opts.cleartype&&!opts.cleartypeNoBg){clearTypeFix($s);}if(opts.fit&&opts.width){$s.width(opts.width);}if(opts.fit&&opts.height&&opts.height!="auto"){$s.height(opts.height);}s.cycleH=(opts.fit&&opts.height)?opts.height:$s.height();s.cycleW=(opts.fit&&opts.width)?opts.width:$s.width();$s.css(opts.cssBefore);if(opts.pager||opts.pagerAnchorBuilder){$.fn.cycle.createPagerAnchor(els.length-1,s,$(opts.pager),els,opts);}if($.isFunction(opts.onAddSlide)){opts.onAddSlide($s);}else{$s.hide();}};}$.fn.cycle.resetState=function(opts,fx){fx=fx||opts.fx;opts.before=[];opts.after=[];opts.cssBefore=$.extend({},opts.original.cssBefore);opts.cssAfter=$.extend({},opts.original.cssAfter);opts.animIn=$.extend({},opts.original.animIn);opts.animOut=$.extend({},opts.original.animOut);opts.fxFn=null;$.each(opts.original.before,function(){opts.before.push(this);});$.each(opts.original.after,function(){opts.after.push(this);});var init=$.fn.cycle.transitions[fx];if($.isFunction(init)){init(opts.$cont,$(opts.elements),opts);}};function go(els,opts,manual,fwd){var p=opts.$cont[0],curr=els[opts.currSlide],next=els[opts.nextSlide];if(manual&&opts.busy&&opts.manualTrump){debug("manualTrump in go(), stopping active transition");$(els).stop(true,true);opts.busy=0;clearTimeout(p.cycleTimeout);}if(opts.busy){debug("transition active, ignoring new tx request");return;}if(p.cycleStop!=opts.stopCount||p.cycleTimeout===0&&!manual){return;}if(!manual&&!p.cyclePause&&!opts.bounce&&((opts.autostop&&(--opts.countdown<=0))||(opts.nowrap&&!opts.random&&opts.nextSlide<opts.currSlide))){if(opts.end){opts.end(opts);}return;}var changed=false;if((manual||!p.cyclePause)&&(opts.nextSlide!=opts.currSlide)){changed=true;var fx=opts.fx;curr.cycleH=curr.cycleH||$(curr).height();curr.cycleW=curr.cycleW||$(curr).width();next.cycleH=next.cycleH||$(next).height();next.cycleW=next.cycleW||$(next).width();if(opts.multiFx){if(fwd&&(opts.lastFx===undefined||++opts.lastFx>=opts.fxs.length)){opts.lastFx=0;}else{if(!fwd&&(opts.lastFx===undefined||--opts.lastFx<0)){opts.lastFx=opts.fxs.length-1;}}fx=opts.fxs[opts.lastFx];}if(opts.oneTimeFx){fx=opts.oneTimeFx;opts.oneTimeFx=null;}$.fn.cycle.resetState(opts,fx);if(opts.before.length){$.each(opts.before,function(i,o){if(p.cycleStop!=opts.stopCount){return;}o.apply(next,[curr,next,opts,fwd]);});}var after=function(){opts.busy=0;$.each(opts.after,function(i,o){if(p.cycleStop!=opts.stopCount){return;}o.apply(next,[curr,next,opts,fwd]);});if(!p.cycleStop){queueNext();}};debug("tx firing("+fx+"); currSlide: "+opts.currSlide+"; nextSlide: "+opts.nextSlide);opts.busy=1;if(opts.fxFn){opts.fxFn(curr,next,opts,after,fwd,manual&&opts.fastOnEvent);}else{if($.isFunction($.fn.cycle[opts.fx])){$.fn.cycle[opts.fx](curr,next,opts,after,fwd,manual&&opts.fastOnEvent);}else{$.fn.cycle.custom(curr,next,opts,after,fwd,manual&&opts.fastOnEvent);}}}else{queueNext();}if(changed||opts.nextSlide==opts.currSlide){var roll;opts.lastSlide=opts.currSlide;if(opts.random){opts.currSlide=opts.nextSlide;if(++opts.randomIndex==els.length){opts.randomIndex=0;opts.randomMap.sort(function(a,b){return Math.random()-0.5;});}opts.nextSlide=opts.randomMap[opts.randomIndex];if(opts.nextSlide==opts.currSlide){opts.nextSlide=(opts.currSlide==opts.slideCount-1)?0:opts.currSlide+1;}}else{if(opts.backwards){roll=(opts.nextSlide-1)<0;if(roll&&opts.bounce){opts.backwards=!opts.backwards;opts.nextSlide=1;opts.currSlide=0;}else{opts.nextSlide=roll?(els.length-1):opts.nextSlide-1;opts.currSlide=roll?0:opts.nextSlide+1;}}else{roll=(opts.nextSlide+1)==els.length;if(roll&&opts.bounce){opts.backwards=!opts.backwards;opts.nextSlide=els.length-2;opts.currSlide=els.length-1;}else{opts.nextSlide=roll?0:opts.nextSlide+1;opts.currSlide=roll?els.length-1:opts.nextSlide-1;}}}}if(changed&&opts.pager){opts.updateActivePagerLink(opts.pager,opts.currSlide,opts.activePagerClass);}function queueNext(){var ms=0,timeout=opts.timeout;if(opts.timeout&&!opts.continuous){ms=getTimeout(els[opts.currSlide],els[opts.nextSlide],opts,fwd);if(opts.fx=="shuffle"){ms-=opts.speedOut;}}else{if(opts.continuous&&p.cyclePause){ms=10;}}if(ms>0){p.cycleTimeout=setTimeout(function(){go(els,opts,0,!opts.backwards);},ms);}}}$.fn.cycle.updateActivePagerLink=function(pager,currSlide,clsName){$(pager).each(function(){$(this).children().removeClass(clsName).eq(currSlide).addClass(clsName);});};function getTimeout(curr,next,opts,fwd){if(opts.timeoutFn){var t=opts.timeoutFn.call(curr,curr,next,opts,fwd);while(opts.fx!="none"&&(t-opts.speed)<250){t+=opts.speed;}debug("calculated timeout: "+t+"; speed: "+opts.speed);if(t!==false){return t;}}return opts.timeout;}$.fn.cycle.next=function(opts){advance(opts,1);};$.fn.cycle.prev=function(opts){advance(opts,0);};function advance(opts,moveForward){var val=moveForward?1:-1;var els=opts.elements;var p=opts.$cont[0],timeout=p.cycleTimeout;if(timeout){clearTimeout(timeout);p.cycleTimeout=0;}if(opts.random&&val<0){opts.randomIndex--;if(--opts.randomIndex==-2){opts.randomIndex=els.length-2;}else{if(opts.randomIndex==-1){opts.randomIndex=els.length-1;}}opts.nextSlide=opts.randomMap[opts.randomIndex];}else{if(opts.random){opts.nextSlide=opts.randomMap[opts.randomIndex];}else{opts.nextSlide=opts.currSlide+val;if(opts.nextSlide<0){if(opts.nowrap){return false;}opts.nextSlide=els.length-1;}else{if(opts.nextSlide>=els.length){if(opts.nowrap){return false;}opts.nextSlide=0;}}}}var cb=opts.onPrevNextEvent||opts.prevNextClick;if($.isFunction(cb)){cb(val>0,opts.nextSlide,els[opts.nextSlide]);}go(els,opts,1,moveForward);return false;}function buildPager(els,opts){var $p=$(opts.pager);$.each(els,function(i,o){$.fn.cycle.createPagerAnchor(i,o,$p,els,opts);});opts.updateActivePagerLink(opts.pager,opts.startingSlide,opts.activePagerClass);}$.fn.cycle.createPagerAnchor=function(i,el,$p,els,opts){var a;if($.isFunction(opts.pagerAnchorBuilder)){a=opts.pagerAnchorBuilder(i,el);debug("pagerAnchorBuilder("+i+", el) returned: "+a);}else{a='<a href="#">'+(i+1)+"</a>";}if(!a){return;}var $a=$(a);if($a.parents("body").length===0){var arr=[];if($p.length>1){$p.each(function(){var $clone=$a.clone(true);$(this).append($clone);arr.push($clone[0]);});$a=$(arr);}else{$a.appendTo($p);}}opts.pagerAnchors=opts.pagerAnchors||[];opts.pagerAnchors.push($a);var pagerFn=function(e){e.preventDefault();opts.nextSlide=i;var p=opts.$cont[0],timeout=p.cycleTimeout;if(timeout){clearTimeout(timeout);p.cycleTimeout=0;}var cb=opts.onPagerEvent||opts.pagerClick;if($.isFunction(cb)){cb(opts.nextSlide,els[opts.nextSlide]);}go(els,opts,1,opts.currSlide<i);};if(/mouseenter|mouseover/i.test(opts.pagerEvent)){$a.hover(pagerFn,function(){});}else{$a.bind(opts.pagerEvent,pagerFn);}if(!/^click/.test(opts.pagerEvent)&&!opts.allowPagerClickBubble){$a.bind("click.cycle",function(){return false;});}var cont=opts.$cont[0];var pauseFlag=false;if(opts.pauseOnPagerHover){$a.hover(function(){pauseFlag=true;cont.cyclePause++;triggerPause(cont,true,true);},function(){if(pauseFlag){cont.cyclePause--;}triggerPause(cont,true,true);});}};$.fn.cycle.hopsFromLast=function(opts,fwd){var hops,l=opts.lastSlide,c=opts.currSlide;if(fwd){hops=c>l?c-l:opts.slideCount-l;}else{hops=c<l?l-c:l+opts.slideCount-c;}return hops;};function clearTypeFix($slides){debug("applying clearType background-color hack");function hex(s){s=parseInt(s,10).toString(16);return s.length<2?"0"+s:s;}function getBg(e){for(;e&&e.nodeName.toLowerCase()!="html";e=e.parentNode){var v=$.css(e,"background-color");if(v&&v.indexOf("rgb")>=0){var rgb=v.match(/\d+/g);return"#"+hex(rgb[0])+hex(rgb[1])+hex(rgb[2]);}if(v&&v!="transparent"){return v;}}return"#ffffff";}$slides.each(function(){$(this).css("background-color",getBg(this));});}$.fn.cycle.commonReset=function(curr,next,opts,w,h,rev){$(opts.elements).not(curr).hide();if(typeof opts.cssBefore.opacity=="undefined"){opts.cssBefore.opacity=1;}opts.cssBefore.display="block";if(opts.slideResize&&w!==false&&next.cycleW>0){opts.cssBefore.width=next.cycleW;}if(opts.slideResize&&h!==false&&next.cycleH>0){opts.cssBefore.height=next.cycleH;}opts.cssAfter=opts.cssAfter||{};opts.cssAfter.display="none";$(curr).css("zIndex",opts.slideCount+(rev===true?1:0));$(next).css("zIndex",opts.slideCount+(rev===true?0:1));};$.fn.cycle.custom=function(curr,next,opts,cb,fwd,speedOverride){var $l=$(curr),$n=$(next);var speedIn=opts.speedIn,speedOut=opts.speedOut,easeIn=opts.easeIn,easeOut=opts.easeOut,animInDelay=opts.animInDelay,animOutDelay=opts.animOutDelay;$n.css(opts.cssBefore);if(speedOverride){if(typeof speedOverride=="number"){speedIn=speedOut=speedOverride;}else{speedIn=speedOut=1;}easeIn=easeOut=null;}var fn=function(){$n.delay(animInDelay).animate(opts.animIn,speedIn,easeIn,function(){cb();});};$l.delay(animOutDelay).animate(opts.animOut,speedOut,easeOut,function(){$l.css(opts.cssAfter);if(!opts.sync){fn();}});if(opts.sync){fn();}};$.fn.cycle.transitions={fade:function($cont,$slides,opts){$slides.not(":eq("+opts.currSlide+")").css("opacity",0);opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts);opts.cssBefore.opacity=0;});opts.animIn={opacity:1};opts.animOut={opacity:0};opts.cssBefore={top:0,left:0};}};$.fn.cycle.ver=function(){return ver;};$.fn.cycle.defaults={activePagerClass:"activeSlide",after:null,allowPagerClickBubble:false,animIn:null,animInDelay:0,animOut:null,animOutDelay:0,aspect:false,autostop:0,autostopCount:0,backwards:false,before:null,center:null,cleartype:!$.support.opacity,cleartypeNoBg:false,containerResize:1,containerResizeHeight:0,continuous:0,cssAfter:null,cssBefore:null,delay:0,easeIn:null,easeOut:null,easing:null,end:null,fastOnEvent:0,fit:0,fx:"fade",fxFn:null,height:"auto",manualTrump:true,metaAttr:"cycle",next:null,nowrap:0,onPagerEvent:null,onPrevNextEvent:null,pager:null,pagerAnchorBuilder:null,pagerEvent:"click.cycle",pause:0,pauseOnPagerHover:0,prev:null,prevNextEvent:"click.cycle",random:0,randomizeEffects:1,requeueOnImageNotLoaded:true,requeueTimeout:250,rev:0,shuffle:null,skipInitializationCallbacks:false,slideExpr:null,slideResize:1,speed:1000,speedIn:null,speedOut:null,startingSlide:undefined,sync:1,timeout:4000,timeoutFn:null,updateActivePagerLink:null,width:null};})(jQuery);
/*
 * jQuery Cycle Plugin Transition Definitions
 * This script is a plugin for the jQuery Cycle Plugin
 * Examples and documentation at: http://malsup.com/jquery/cycle/
 * Copyright (c) 2007-2010 M. Alsup
 * Version:	 2.73
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function($){$.fn.cycle.transitions.none=function($cont,$slides,opts){opts.fxFn=function(curr,next,opts,after){$(next).show();$(curr).hide();after();};};$.fn.cycle.transitions.fadeout=function($cont,$slides,opts){$slides.not(":eq("+opts.currSlide+")").css({display:"block",opacity:1});opts.before.push(function(curr,next,opts,w,h,rev){$(curr).css("zIndex",opts.slideCount+(rev!==true?1:0));$(next).css("zIndex",opts.slideCount+(rev!==true?0:1));});opts.animIn.opacity=1;opts.animOut.opacity=0;opts.cssBefore.opacity=1;opts.cssBefore.display="block";opts.cssAfter.zIndex=0;};$.fn.cycle.transitions.scrollUp=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push($.fn.cycle.commonReset);var h=$cont.height();opts.cssBefore.top=h;opts.cssBefore.left=0;opts.cssFirst.top=0;opts.animIn.top=0;opts.animOut.top=-h;};$.fn.cycle.transitions.scrollDown=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push($.fn.cycle.commonReset);var h=$cont.height();opts.cssFirst.top=0;opts.cssBefore.top=-h;opts.cssBefore.left=0;opts.animIn.top=0;opts.animOut.top=h;};$.fn.cycle.transitions.scrollLeft=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push($.fn.cycle.commonReset);var w=$cont.width();opts.cssFirst.left=0;opts.cssBefore.left=w;opts.cssBefore.top=0;opts.animIn.left=0;opts.animOut.left=0-w;};$.fn.cycle.transitions.scrollRight=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push($.fn.cycle.commonReset);var w=$cont.width();opts.cssFirst.left=0;opts.cssBefore.left=-w;opts.cssBefore.top=0;opts.animIn.left=0;opts.animOut.left=w;};$.fn.cycle.transitions.scrollHorz=function($cont,$slides,opts){$cont.css("overflow","hidden").width();opts.before.push(function(curr,next,opts,fwd){if(opts.rev){fwd=!fwd;}$.fn.cycle.commonReset(curr,next,opts);opts.cssBefore.left=fwd?(next.cycleW-1):(1-next.cycleW);opts.animOut.left=fwd?-curr.cycleW:curr.cycleW;});opts.cssFirst.left=0;opts.cssBefore.top=0;opts.animIn.left=0;opts.animOut.top=0;};$.fn.cycle.transitions.scrollVert=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push(function(curr,next,opts,fwd){if(opts.rev){fwd=!fwd;}$.fn.cycle.commonReset(curr,next,opts);opts.cssBefore.top=fwd?(1-next.cycleH):(next.cycleH-1);opts.animOut.top=fwd?curr.cycleH:-curr.cycleH;});opts.cssFirst.top=0;opts.cssBefore.left=0;opts.animIn.top=0;opts.animOut.left=0;};$.fn.cycle.transitions.slideX=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$(opts.elements).not(curr).hide();$.fn.cycle.commonReset(curr,next,opts,false,true);opts.animIn.width=next.cycleW;});opts.cssBefore.left=0;opts.cssBefore.top=0;opts.cssBefore.width=0;opts.animIn.width="show";opts.animOut.width=0;};$.fn.cycle.transitions.slideY=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$(opts.elements).not(curr).hide();$.fn.cycle.commonReset(curr,next,opts,true,false);opts.animIn.height=next.cycleH;});opts.cssBefore.left=0;opts.cssBefore.top=0;opts.cssBefore.height=0;opts.animIn.height="show";opts.animOut.height=0;};$.fn.cycle.transitions.shuffle=function($cont,$slides,opts){var i,w=$cont.css("overflow","visible").width();$slides.css({left:0,top:0});opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,true,true,true);});if(!opts.speedAdjusted){opts.speed=opts.speed/2;opts.speedAdjusted=true;}opts.random=0;opts.shuffle=opts.shuffle||{left:-w,top:15};opts.els=[];for(i=0;i<$slides.length;i++){opts.els.push($slides[i]);}for(i=0;i<opts.currSlide;i++){opts.els.push(opts.els.shift());}opts.fxFn=function(curr,next,opts,cb,fwd){if(opts.rev){fwd=!fwd;}var $el=fwd?$(curr):$(next);$(next).css(opts.cssBefore);var count=opts.slideCount;$el.animate(opts.shuffle,opts.speedIn,opts.easeIn,function(){var hops=$.fn.cycle.hopsFromLast(opts,fwd);for(var k=0;k<hops;k++){if(fwd){opts.els.push(opts.els.shift());}else{opts.els.unshift(opts.els.pop());}}if(fwd){for(var i=0,len=opts.els.length;i<len;i++){$(opts.els[i]).css("z-index",len-i+count);}}else{var z=$(curr).css("z-index");$el.css("z-index",parseInt(z,10)+1+count);}$el.animate({left:0,top:0},opts.speedOut,opts.easeOut,function(){$(fwd?this:curr).hide();if(cb){cb();}});});};$.extend(opts.cssBefore,{display:"block",opacity:1,top:0,left:0});};$.fn.cycle.transitions.turnUp=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,true,false);opts.cssBefore.top=next.cycleH;opts.animIn.height=next.cycleH;opts.animOut.width=next.cycleW;});opts.cssFirst.top=0;opts.cssBefore.left=0;opts.cssBefore.height=0;opts.animIn.top=0;opts.animOut.height=0;};$.fn.cycle.transitions.turnDown=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,true,false);opts.animIn.height=next.cycleH;opts.animOut.top=curr.cycleH;});opts.cssFirst.top=0;opts.cssBefore.left=0;opts.cssBefore.top=0;opts.cssBefore.height=0;opts.animOut.height=0;};$.fn.cycle.transitions.turnLeft=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,false,true);opts.cssBefore.left=next.cycleW;opts.animIn.width=next.cycleW;});opts.cssBefore.top=0;opts.cssBefore.width=0;opts.animIn.left=0;opts.animOut.width=0;};$.fn.cycle.transitions.turnRight=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,false,true);opts.animIn.width=next.cycleW;opts.animOut.left=curr.cycleW;});$.extend(opts.cssBefore,{top:0,left:0,width:0});opts.animIn.left=0;opts.animOut.width=0;};$.fn.cycle.transitions.zoom=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,false,false,true);opts.cssBefore.top=next.cycleH/2;opts.cssBefore.left=next.cycleW/2;$.extend(opts.animIn,{top:0,left:0,width:next.cycleW,height:next.cycleH});$.extend(opts.animOut,{width:0,height:0,top:curr.cycleH/2,left:curr.cycleW/2});});opts.cssFirst.top=0;opts.cssFirst.left=0;opts.cssBefore.width=0;opts.cssBefore.height=0;};$.fn.cycle.transitions.fadeZoom=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,false,false);opts.cssBefore.left=next.cycleW/2;opts.cssBefore.top=next.cycleH/2;$.extend(opts.animIn,{top:0,left:0,width:next.cycleW,height:next.cycleH});});opts.cssBefore.width=0;opts.cssBefore.height=0;opts.animOut.opacity=0;};$.fn.cycle.transitions.blindX=function($cont,$slides,opts){var w=$cont.css("overflow","hidden").width();opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts);opts.animIn.width=next.cycleW;opts.animOut.left=curr.cycleW;});opts.cssBefore.left=w;opts.cssBefore.top=0;opts.animIn.left=0;opts.animOut.left=w;};$.fn.cycle.transitions.blindY=function($cont,$slides,opts){var h=$cont.css("overflow","hidden").height();opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts);opts.animIn.height=next.cycleH;opts.animOut.top=curr.cycleH;});opts.cssBefore.top=h;opts.cssBefore.left=0;opts.animIn.top=0;opts.animOut.top=h;};$.fn.cycle.transitions.blindZ=function($cont,$slides,opts){var h=$cont.css("overflow","hidden").height();var w=$cont.width();opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts);opts.animIn.height=next.cycleH;opts.animOut.top=curr.cycleH;});opts.cssBefore.top=h;opts.cssBefore.left=w;opts.animIn.top=0;opts.animIn.left=0;opts.animOut.top=h;opts.animOut.left=w;};$.fn.cycle.transitions.growX=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,false,true);opts.cssBefore.left=this.cycleW/2;opts.animIn.left=0;opts.animIn.width=this.cycleW;opts.animOut.left=0;});opts.cssBefore.top=0;opts.cssBefore.width=0;};$.fn.cycle.transitions.growY=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,true,false);opts.cssBefore.top=this.cycleH/2;opts.animIn.top=0;opts.animIn.height=this.cycleH;opts.animOut.top=0;});opts.cssBefore.height=0;opts.cssBefore.left=0;};$.fn.cycle.transitions.curtainX=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,false,true,true);opts.cssBefore.left=next.cycleW/2;opts.animIn.left=0;opts.animIn.width=this.cycleW;opts.animOut.left=curr.cycleW/2;opts.animOut.width=0;});opts.cssBefore.top=0;opts.cssBefore.width=0;};$.fn.cycle.transitions.curtainY=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,true,false,true);opts.cssBefore.top=next.cycleH/2;opts.animIn.top=0;opts.animIn.height=next.cycleH;opts.animOut.top=curr.cycleH/2;opts.animOut.height=0;});opts.cssBefore.height=0;opts.cssBefore.left=0;};$.fn.cycle.transitions.cover=function($cont,$slides,opts){var d=opts.direction||"left";var w=$cont.css("overflow","hidden").width();var h=$cont.height();opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts);opts.cssAfter.display="";if(d=="right"){opts.cssBefore.left=-w;}else{if(d=="up"){opts.cssBefore.top=h;}else{if(d=="down"){opts.cssBefore.top=-h;}else{opts.cssBefore.left=w;}}}});opts.animIn.left=0;opts.animIn.top=0;opts.cssBefore.top=0;opts.cssBefore.left=0;};$.fn.cycle.transitions.uncover=function($cont,$slides,opts){var d=opts.direction||"left";var w=$cont.css("overflow","hidden").width();var h=$cont.height();opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,true,true,true);if(d=="right"){opts.animOut.left=w;}else{if(d=="up"){opts.animOut.top=-h;}else{if(d=="down"){opts.animOut.top=h;}else{opts.animOut.left=-w;}}}});opts.animIn.left=0;opts.animIn.top=0;opts.cssBefore.top=0;opts.cssBefore.left=0;};$.fn.cycle.transitions.toss=function($cont,$slides,opts){var w=$cont.css("overflow","visible").width();var h=$cont.height();opts.before.push(function(curr,next,opts){$.fn.cycle.commonReset(curr,next,opts,true,true,true);if(!opts.animOut.left&&!opts.animOut.top){$.extend(opts.animOut,{left:w*2,top:-h/2,opacity:0});}else{opts.animOut.opacity=0;}});opts.cssBefore.left=0;opts.cssBefore.top=0;opts.animIn.left=0;};$.fn.cycle.transitions.wipe=function($cont,$slides,opts){var w=$cont.css("overflow","hidden").width();var h=$cont.height();opts.cssBefore=opts.cssBefore||{};var clip;if(opts.clip){if(/l2r/.test(opts.clip)){clip="rect(0px 0px "+h+"px 0px)";}else{if(/r2l/.test(opts.clip)){clip="rect(0px "+w+"px "+h+"px "+w+"px)";}else{if(/t2b/.test(opts.clip)){clip="rect(0px "+w+"px 0px 0px)";}else{if(/b2t/.test(opts.clip)){clip="rect("+h+"px "+w+"px "+h+"px 0px)";}else{if(/zoom/.test(opts.clip)){var top=parseInt(h/2,10);var left=parseInt(w/2,10);clip="rect("+top+"px "+left+"px "+top+"px "+left+"px)";}}}}}}opts.cssBefore.clip=opts.cssBefore.clip||clip||"rect(0px 0px 0px 0px)";var d=opts.cssBefore.clip.match(/(\d+)/g);var t=parseInt(d[0],10),r=parseInt(d[1],10),b=parseInt(d[2],10),l=parseInt(d[3],10);opts.before.push(function(curr,next,opts){if(curr==next){return;}var $curr=$(curr),$next=$(next);$.fn.cycle.commonReset(curr,next,opts,true,true,false);opts.cssAfter.display="block";var step=1,count=parseInt((opts.speedIn/13),10)-1;(function f(){var tt=t?t-parseInt(step*(t/count),10):0;var ll=l?l-parseInt(step*(l/count),10):0;var bb=b<h?b+parseInt(step*((h-b)/count||1),10):h;var rr=r<w?r+parseInt(step*((w-r)/count||1),10):w;$next.css({clip:"rect("+tt+"px "+rr+"px "+bb+"px "+ll+"px)"});(step++<=count)?setTimeout(f,13):$curr.css("display","none");})();});$.extend(opts.cssBefore,{display:"block",opacity:1,top:0,left:0});opts.animIn={left:0};opts.animOut={left:0};};})(jQuery);/**
* hoverIntent r6 // 2011.02.26 // jQuery 1.5.1+
* <http://cherne.net/brian/resources/jquery.hoverIntent.html>
* 
* @param  f  onMouseOver function || An object with configuration options
* @param  g  onMouseOut function  || Nothing (use configuration options object)
* @author    Brian Cherne brian(at)cherne(dot)net
*/
(function($){$.fn.hoverIntent=function(f,g){var cfg={sensitivity:7,interval:100,timeout:0};cfg=$.extend(cfg,g?{over:f,out:g}:f);var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if((Math.abs(pX-cX)+Math.abs(pY-cY))<cfg.sensitivity){$(ob).unbind("mousemove",track);ob.hoverIntent_s=1;return cfg.over.apply(ob,[ev])}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=0;return cfg.out.apply(ob,[ev])};var handleHover=function(e){var ev=jQuery.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t)}if(e.type=="mouseenter"){pX=ev.pageX;pY=ev.pageY;$(ob).bind("mousemove",track);if(ob.hoverIntent_s!=1){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}}else{$(ob).unbind("mousemove",track);if(ob.hoverIntent_s==1){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob)},cfg.timeout)}}};return this.bind('mouseenter',handleHover).bind('mouseleave',handleHover)}})(jQuery);