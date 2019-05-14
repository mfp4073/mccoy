// ImageBox - a jQuery lightbox component
// Copyright (c) 2014 John Cardinal (John@JohnCardinal.com)
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

// This code includes ideas and source code culled from ColorBox v1.3.6 by
// Jack Moore (www.colorpowered.com, jack@colorpowered.com)

// 2014-01-17 - v1.2 - Removed support for IE6

// Define plugin
(function($) {
  var $window,
    $siblContainer,
    $siblControls,
    $siblStatus,
    $siblPrevious,
    $siblSlideshow,
    $siblNext,
    $siblClose,
    $siblCaption,
    $siblContent,
    $siblOverlay,
    $siblImage,
    $imageGroup = [],
    iImageIndex,
    iCloseWidth = 0,
    bIsMoving = false,
    bShowControls = false,
    oOptions,
    sDataKey = 'siblOptions';

  // Plugin function: assign class to selected elements
  $.fn.imageBox = function(options) {
    if (!this.length) return this;

    this.each(function() {
      $(this)
        .data(sDataKey, $.extend({}, $(this).data(sDataKey)
            ? $(this).data(sDataKey)
            : $.fn.imageBox.options, options))
        .addClass('siblImage');
    });
    
    return this;
  };

  // Options
  $.fn.imageBox.options = {
    autoFocus: false,
    overlayClose: true,
    opacity: 0.6,
    speed: 400,
    getHref: function(element) { return element.href; },
    getCaption: function(element) { return element.title; },
    getUseMap: function(element) { return ''; },
    status: '{index} / {total}'
  };

  // Template
  // At some point, I'd like to make this customizable by caller
  var sTemplate = 
      '<div id="siblContainer">' +
        '<div id="siblControls">' +
          '<div id="siblStatus"/>' + 
          '<button id="siblPrevious"/>' +
          '<button id="siblSlideshow"/>' +
          '<button id="siblNext"/>' +
        '</div>' + 
        '<button id="siblClose"/>' +
        '<div id="siblCaption"/>' +
        '<div id="siblContent"/>' +
      '</div>';

  function closeContainer() {
    $window.unbind('resize.sibl scroll.sibl');
    $(document).unbind('keydown.sibl');
    $siblOverlay.css({'cursor': 'auto'}).fadeOut();
    $siblControls.children().hide();
    $siblContainer.slideUp('fast', function() {
      $siblContainer.children().hide();
      $siblContent.children().hide();
      //$('#siblContainer div.siblStretch').show();
      bIsMoving = false;
    });
  };

  function loadOptions(element) {
    oOptions = $(element).data(sDataKey);
    oOptions.useMap = oOptions.getUseMap(element);
    oOptions.rel = oOptions.rel || element.rel;
    oOptions.href = oOptions.href || oOptions.getHref(element);
    oOptions.caption = oOptions.caption || oOptions.getCaption(element);
  };

  function openContainer(element) {
    loadOptions(element);

    $siblOverlay
      .css({ opacity: oOptions.opacity })
      .show();
    if (oOptions.overlayClose) {
      $siblOverlay.css({'cursor': 'pointer'}).one('click', closeContainer);
    };

    $siblContent.width(100).height(100);

    if (oOptions.rel && oOptions.rel !== 'nofollow') {
      $imageGroup = $('.siblImage').filter(function() {
        var relRelated = $(this).data(sDataKey).rel || this.rel;
        return (relRelated === oOptions.rel);
      });
      iImageIndex = $imageGroup.index(element);
    } else {
      $imageGroup = $(element);
      iImageIndex = 0;
    };
    bShowControls = ($imageGroup.length>1);
    if (bShowControls) {
      $siblControls.show();
    } else {
      $siblControls.hide();
    };

    // Navigation keys
    $(document)
      .bind("keydown.sibl", function(event) {
        if (event.keyCode === 27) {
          event.preventDefault();
          closeContainer();
        };
      })
      .bind("keydown.sibl", function(event) {
        if ($imageGroup.length > 1) {
          if (event.keyCode === 37) {
            event.preventDefault();
            $siblPrevious.click();
          } else if (event.keyCode === 39) {
            event.preventDefault();
            $siblNext.click();
          };
        };
      });
  };

  function loadImage(element) {
    bIsMoving = true;
    loadOptions(element);

    setContentBackground(true);
    setContainerPosition();
    $siblContainer.show();
  
    // Remove old image, if any
    $siblContent.empty();

    // Load this image
    $siblImage = $('<img id="siblImage"' + oOptions.useMap +'/>')
      .css({ display: 'none' })
      .appendTo($siblContent)
      .attr({ src: oOptions.href });

    // React to image when it's available
    if ($siblImage[0].complete) {
      imageLoaded();
    } else {
      $siblImage.one('load', imageLoaded);
    };

    $window.bind('resize.sibl', setContainerPosition);
  };

  function setContentBackground(show) {
    var oCSS = {};
    if (show) {
      oCSS.background = 'url("imageboxloading.gif") center center no-repeat';
    } else {
      oCSS.backgroundImage = 'none';
    };
    $siblContent.css(oCSS).show();
  };
  
  function setContainerPosition() {
    var containerLeft = Math.floor(Math.max(document.documentElement.clientWidth -
          $siblContainer.outerWidth(false),0)/2) + $window.scrollLeft();

    // Delay getting width until it's available
    if (iCloseWidth == 0) iCloseWidth = $siblClose.width();

/*
log('w(w,h),(l,t)=w('+$siblContainer.outerWidth(false)+','+
  $siblContainer.outerHeight(false)+'), ('+
  $siblContainer.css('top')+','+
  containerLeft+'), '+
  $siblContent.width()+', '+
  $(this).width());
*/
    $siblContainer.css({left: containerLeft+'px'});
    if (bShowControls) {
      $siblControls.add($siblCaption).width($siblContent.width());
    } else {
      $siblCaption.width($siblContent.width()-(iCloseWidth*2));
    };
  };

  function imageLoaded() {
    setContentBackground(false);
    moveContainer(Math.max($siblImage.width(), 200), $siblImage.height())
  };

  function moveContainer(contentWidth, contentHeight) {
    function containerMoved() {
      if (bShowControls) {
        $siblControls.width($siblImage.width()).show();
        $siblCaption.css({ marginLeft: 0, marginRight: 0 });
      } else {
        $siblCaption.css({ marginLeft: iCloseWidth+'px', marginRight: iCloseWidth+'px' });
      };
      setContainerPosition();
      $siblContent.css('margin-top',
          (!bShowControls && !oOptions.caption)
          ? $siblClose.height()+'px'
          : '');
      if (oOptions.caption) {
        $siblCaption
          .width(contentWidth - (bShowControls ? 0 : iCloseWidth*2))
          .html(oOptions.caption)
          .slideDown('fast');
      };
      $siblImage.show();

      $siblClose.show();

      if ($imageGroup.length>1) {
        $siblStatus.html(oOptions.status
          .replace(/\{index\}/, iImageIndex+1)
          .replace(/\{total\}/, $imageGroup.length))
          .show();
        $siblNext.add($siblPrevious).show();
        if (oOptions.autoFocus) $siblNext.focus();
      } else {
        if (oOptions.autoFocus) $siblClose.focus();
      };

      bIsMoving = false;
    };

    $siblContainer.css({top: Math.max($window.scrollTop()+12)+'px'});
    $siblCaption.slideUp('fast'); // Remove?
    $siblContent.dequeue().animate(
        { width: contentWidth, height: contentHeight },
        { duration: oOptions.speed, complete: containerMoved, step: setContainerPosition });
  };

  // Navigation
  function movePrevious() {
    if (!bIsMoving) {
      iImageIndex = iImageIndex > 0 ? iImageIndex-1 : $imageGroup.length-1;
      loadImage($imageGroup[iImageIndex]);
    };
  };

  function moveNext() {
    if (!bIsMoving) {
      iImageIndex = iImageIndex < $imageGroup.length-1 ? iImageIndex+1 : 0;
      loadImage($imageGroup[iImageIndex]);
    };
  };

  function getSiblElement(name) {
    return $('#sibl'+name).hide();
  };

  function initialize() {
    $window = $(window);
    oOptions = $.extend({}, $.fn.imageBox.options);

    $(sTemplate).prependTo('body');

    $siblContainer = getSiblElement('Container');
    $siblClose = getSiblElement('Close');
    $siblControls = getSiblElement('Controls');
    $siblStatus = getSiblElement('Status');
    $siblPrevious= getSiblElement('Previous');
    $siblSlideshow = getSiblElement('Slideshow');
    $siblNext = getSiblElement('Next');
    $siblCaption = getSiblElement('Caption');
    $siblContent = getSiblElement('Content');
    $siblOverlay = $('<div id="siblOverlay"/>')
      .css({ opacity: oOptions.opacity })
      .hide()
      .prependTo('body');

    $siblImage = $('<img id="siblImage"/>').hide().appendTo($siblContent);

    // Add rollover handler to navigation elements
    $siblControls.children().filter('button')
      .bind('mouseover mouseout', function(){
        $(this).toggleClass('hover');
      });
    
    // Set navigation handlers
    $siblPrevious.click(movePrevious);
    $siblNext.click(moveNext);

    $siblClose.click( function() {
      closeContainer();
    });

    // Use event delegation via .live() so click handler applies to DOM
    // elements that are later assigned the "siblImage" class 
    // $('.siblImage').live('click', function(event) {
    $('body').on('click','.siblImage', function(event) {
      event.preventDefault();
      openContainer(this);
      loadImage(this);
    });

  };

  // Call initialize when DOM is loaded
  $(initialize);
}(jQuery));

function log(message) {
  $('#log').append(message + '<br>');
  $('#log').animate({ scrollTop: $('#log').attr('scrollHeight') - $('#log').height() }, 0);
};