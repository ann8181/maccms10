(function ($) {
  var defaults = {
    wrapContent: "<div class='jQuery-imageUpload'>",
    inputFileName: "inputFile",
    inputFileClass: "inputFile",
    uploadButtonValue: "Upload",
    uploadButtonClass: "uploadButton",
    browseButtonValue: "Browse",
    browseButtonClass: "browseButton",
    deleteButtonValue: "Delete image",
    deleteButtonClass: "deleteButton",
    automaticUpload: false,
    formClass: "controlForm",
    hideFileInput: true,
    hideDeleteButton: false,
    hover: true,
    addClass: "jQuery-image-upload"
  };
  $.fn.imageUpload = function (options) {
    var $self = this;
    if (!$self.length) {
      return $self
    }
    var settings = $.extend(defaults, options);
    if ($self.length > 1) {
      $self.each(function () {
        $(this).imageUpload(settings)
      });
      return $self
    }
    if ($self.data("imageUpload")) {
      $self.trigger("imageUpload.reload");
      return $self
    }
    $self.addClass(settings.addClass);
    $self.data("imageUpload", options);
    if (!settings.formAction) {
      throw new Error("Form action was not provided. Please provide it: $(...).imageUpload({formAction: '...'})")
    }
    if (!settings.hover) {
      $self.wrap(settings.wrapContent)
    }
    var $controls = $("<div>").addClass("controls");
    var $fileInput = $("<input>").attr({
      type: "file",
      name: settings.inputFileName
    }).addClass(settings.inputFileClass);
    var $uploadButton = $("<button>").attr("type", "submit").addClass(settings.uploadButtonClass).html(settings.uploadButtonValue);
    var $browseButton = $("<button>").addClass(settings.browseButtonClass).html(settings.browseButtonValue).on("click", function () {
      $fileInput.click();
      return false
    });
    var $deleteButton = $("<button>").addClass(settings.deleteButtonClass).html(settings.deleteButtonValue).on("click", function () {
      $self.trigger("imageUpload.destroy");
      $self.trigger("imageUpload.imageRemoved");
      $self.remove();
      return false
    });
    var iframeId = "uploadIframe-" + Math.random().toString(36).substring(5, 20).toLowerCase();
    var $uploadIframe = $("<iframe>").attr({
      id: iframeId,
      name: iframeId
    }).hide();
    var $uploadForm = $("<form>").addClass(settings.formClass).attr({
      target: $uploadIframe.attr("id"),
      enctype: "multipart/form-data",
      method: "post",
      action: settings.formAction
    });
    $uploadForm.append([$browseButton, $fileInput, $uploadButton, $deleteButton, $uploadIframe]);
    if (settings.hideDeleteButton) {
      $deleteButton.remove()
    }
    if (settings.automaticUpload) {
      $uploadButton.hide();
      $fileInput.on("change", function () {
        if (!$(this).val()) {
          return
        }
        $uploadButton.click()
      })
    }
    if (settings.hideFileInput) {
      $fileInput.hide()
    } else {
      $browseButton.hide()
    }
    $controls.append($uploadForm);
    $uploadForm.on("submit", function () {
      var $form = $(this);
      $uploadIframe.off("load");
      var oldSrc = $self.attr("src");
      if (typeof settings.waiter === "string") {
        $self.attr("src", settings.waiter)
      }
      $self.addClass("loading");
      $controls.hide();
      $uploadIframe.on("load", function () {
        var result = $(this.contentWindow.document).text();
        if (!/^https?|^\//.test(result)) {
          loadImage($self, oldSrc);
          $self.trigger("imageUpload.uploadFailed", [result]);
          return
        }
        if (!result) {
          loadImage($self, oldSrc);
          $self.trigger("imageUpload.uploadFailed", [result]);
          return
        }
        if (settings.hideFileInput) {
          $self.trigger("imageUpload.reload")
        }
        if (!$fileInput.val()) {
          loadImage($self, oldSrc);
          return
        }
        $uploadIframe.attr("src", "");
        loadImage($self, result, function () {
          $self.trigger("imageUpload.imageChanged")
        });
        $fileInput.replaceWith($fileInput.clone(true))
      })
    });
    if (!settings.hover) {
      $self.parent().append($controls)
    } else {
      $controls.css({
        position: "absolute"
      });
      $controls.addClass("jQuery-image-upload-controls");
      $("body").append($controls.hide());
      $self.on("mouseenter", function () {
        if ($self.hasClass("loading")) {
          return
        }
        var offset = $self.offset();
        $controls.css({
          top: offset.top,
          left: offset.left
        });
        $controls.show()
      });
      $("body").on("mouseleave", "." + settings.addClass, function (e) {
        var o = $self.offset();
        var w = $self.width();
        var h = $self.height();
        if (e.pageX < o.left || e.pageX > o.left + w || (e.pageY < o.top || e.pageY > o.top + h)) {
          $controls.hide()
        }
      })
    }
    $self.on("imageUpload.destroy", function () {
      $controls.remove();
      $self.off("imageUpload.destroy");
      $self.off("imageUpload.reload");
      $self.data("imageUpload", null)
    });
    $self.on("imageUpload.reload", function () {
      $self.trigger("imageUpload.destroy");
      $self.imageUpload(options)
    });
    return $self
  };

  function loadImage($imageElement, newSource, callback) {
    $imageElement.fadeOut(function () {
      $imageElement.attr("src", newSource);
      imgLoad($imageElement, function () {
        $imageElement.removeClass("loading");
        $imageElement.fadeIn();
        if (typeof callback === "function") {
          callback()
        }
      })
    })
  }

  function imgLoad(selector, callback) {
    $(selector).each(function () {
      if (this.complete) {
        callback.apply(this)
      } else {
        $(this).on("load", function () {
          callback.apply(this)
        })
      }
    })
  }
  $.imageUpload = $.fn.imageUpload;
  $.imageUpload.defaults = defaults
})($);

/*========================================================================*/
/*AMQ--Joeleo MT 轮播+懒加载
/*========================================================================*/
! function () {
  "use strict";

  function e(e) {
    e.fn.swiper = function (a) {
      var s;
      return e(this).each(function () {
        var e = new t(this, a);
        s || (s = e)
      }), s
    }
  }
  var a, t = function (e, s) {
    function r(e) {
      return Math.floor(e)
    }

    function i() {
      var e = T.params.autoplay,
        a = T.slides.eq(T.activeIndex);
      a.attr("data-swiper-autoplay") && (e = a.attr("data-swiper-autoplay") || T.params.autoplay), T.autoplayTimeoutId = setTimeout(function () {
        T.params.loop ? (T.fixLoop(), T._slideNext(), T.emit("onAutoplay", T)) : T.isEnd ? s.autoplayStopOnLast ? T.stopAutoplay() : (T._slideTo(0), T.emit("onAutoplay", T)) : (T._slideNext(), T.emit("onAutoplay", T))
      }, e)
    }

    function n(e, t) {
      var s = a(e.target);
      if (!s.is(t))
        if ("string" == typeof t) s = s.parents(t);
        else if (t.nodeType) {
        var r;
        return s.parents().each(function (e, a) {
          a === t && (r = t)
        }), r ? t : void 0
      }
      if (0 !== s.length) return s[0]
    }

    function o(e, a) {
      a = a || {};
      var t = window.MutationObserver || window.WebkitMutationObserver,
        s = new t(function (e) {
          e.forEach(function (e) {
            T.onResize(!0), T.emit("onObserverUpdate", T, e)
          })
        });
      s.observe(e, {
        attributes: "undefined" == typeof a.attributes || a.attributes,
        childList: "undefined" == typeof a.childList || a.childList,
        characterData: "undefined" == typeof a.characterData || a.characterData
      }), T.observers.push(s)
    }

    function l(e) {
      e.originalEvent && (e = e.originalEvent);
      var a = e.keyCode || e.charCode;
      if (!T.params.allowSwipeToNext && (T.isHorizontal() && 39 === a || !T.isHorizontal() && 40 === a)) return !1;
      if (!T.params.allowSwipeToPrev && (T.isHorizontal() && 37 === a || !T.isHorizontal() && 38 === a)) return !1;
      if (!(e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || document.activeElement && document.activeElement.nodeName && ("input" === document.activeElement.nodeName.toLowerCase() || "textarea" === document.activeElement.nodeName.toLowerCase()))) {
        if (37 === a || 39 === a || 38 === a || 40 === a) {
          var t = !1;
          if (T.container.parents("." + T.params.slideClass).length > 0 && 0 === T.container.parents("." + T.params.slideActiveClass).length) return;
          var s = {
              left: window.pageXOffset,
              top: window.pageYOffset
            },
            r = window.innerWidth,
            i = window.innerHeight,
            n = T.container.offset();
          T.rtl && (n.left = n.left - T.container[0].scrollLeft);
          for (var o = [
              [n.left, n.top],
              [n.left + T.width, n.top],
              [n.left, n.top + T.height],
              [n.left + T.width, n.top + T.height]
            ], l = 0; l < o.length; l++) {
            var p = o[l];
            p[0] >= s.left && p[0] <= s.left + r && p[1] >= s.top && p[1] <= s.top + i && (t = !0)
          }
          if (!t) return
        }
        T.isHorizontal() ? (37 !== a && 39 !== a || (e.preventDefault ? e.preventDefault() : e.returnValue = !1), (39 === a && !T.rtl || 37 === a && T.rtl) && T.slideNext(), (37 === a && !T.rtl || 39 === a && T.rtl) && T.slidePrev()) : (38 !== a && 40 !== a || (e.preventDefault ? e.preventDefault() : e.returnValue = !1), 40 === a && T.slideNext(), 38 === a && T.slidePrev())
      }
    }

    function p() {
      var e = "onwheel",
        a = e in document;
      if (!a) {
        var t = document.createElement("div");
        t.setAttribute(e, "return;"), a = "function" == typeof t[e]
      }
      return !a && document.implementation && document.implementation.hasFeature && document.implementation.hasFeature("", "") !== !0 && (a = document.implementation.hasFeature("Events.wheel", "3.0")), a
    }

    function d(e) {
      e.originalEvent && (e = e.originalEvent);
      var a = 0,
        t = T.rtl ? -1 : 1,
        s = u(e);
      if (T.params.mousewheelForceToAxis)
        if (T.isHorizontal()) {
          if (!(Math.abs(s.pixelX) > Math.abs(s.pixelY))) return;
          a = s.pixelX * t
        } else {
          if (!(Math.abs(s.pixelY) > Math.abs(s.pixelX))) return;
          a = s.pixelY
        }
      else a = Math.abs(s.pixelX) > Math.abs(s.pixelY) ? -s.pixelX * t : -s.pixelY;
      if (0 !== a) {
        if (T.params.mousewheelInvert && (a = -a), T.params.freeMode) {
          var r = T.getWrapperTranslate() + a * T.params.mousewheelSensitivity,
            i = T.isBeginning,
            n = T.isEnd;
          if (r >= T.minTranslate() && (r = T.minTranslate()), r <= T.maxTranslate() && (r = T.maxTranslate()), T.setWrapperTransition(0), T.setWrapperTranslate(r), T.updateProgress(), T.updateActiveIndex(), (!i && T.isBeginning || !n && T.isEnd) && T.updateClasses(), T.params.freeModeSticky ? (clearTimeout(T.mousewheel.timeout), T.mousewheel.timeout = setTimeout(function () {
              T.slideReset()
            }, 300)) : T.params.lazyLoading && T.lazy && T.lazy.load(), T.emit("onScroll", T, e), T.params.autoplay && T.params.autoplayDisableOnInteraction && T.stopAutoplay(), 0 === r || r === T.maxTranslate()) return
        } else {
          if ((new window.Date).getTime() - T.mousewheel.lastScrollTime > 60)
            if (a < 0)
              if (T.isEnd && !T.params.loop || T.animating) {
                if (T.params.mousewheelReleaseOnEdges) return !0
              } else T.slideNext(), T.emit("onScroll", T, e);
          else if (T.isBeginning && !T.params.loop || T.animating) {
            if (T.params.mousewheelReleaseOnEdges) return !0
          } else T.slidePrev(), T.emit("onScroll", T, e);
          T.mousewheel.lastScrollTime = (new window.Date).getTime()
        }
        return e.preventDefault ? e.preventDefault() : e.returnValue = !1, !1
      }
    }

    function u(e) {
      var a = 10,
        t = 40,
        s = 800,
        r = 0,
        i = 0,
        n = 0,
        o = 0;
      return "detail" in e && (i = e.detail), "wheelDelta" in e && (i = -e.wheelDelta / 120), "wheelDeltaY" in e && (i = -e.wheelDeltaY / 120), "wheelDeltaX" in e && (r = -e.wheelDeltaX / 120), "axis" in e && e.axis === e.HORIZONTAL_AXIS && (r = i, i = 0), n = r * a, o = i * a, "deltaY" in e && (o = e.deltaY), "deltaX" in e && (n = e.deltaX), (n || o) && e.deltaMode && (1 === e.deltaMode ? (n *= t, o *= t) : (n *= s, o *= s)), n && !r && (r = n < 1 ? -1 : 1), o && !i && (i = o < 1 ? -1 : 1), {
        spinX: r,
        spinY: i,
        pixelX: n,
        pixelY: o
      }
    }

    function m(e, t) {
      e = a(e);
      var s, r, i, n = T.rtl ? -1 : 1;
      s = e.attr("data-swiper-parallax") || "0", r = e.attr("data-swiper-parallax-x"), i = e.attr("data-swiper-parallax-y"), r || i ? (r = r || "0", i = i || "0") : T.isHorizontal() ? (r = s, i = "0") : (i = s, r = "0"), r = r.indexOf("%") >= 0 ? parseInt(r, 10) * t * n + "%" : r * t * n + "px", i = i.indexOf("%") >= 0 ? parseInt(i, 10) * t + "%" : i * t + "px", e.transform("translate3d(" + r + ", " + i + ",0px)")
    }

    function c(e) {
      return 0 !== e.indexOf("on") && (e = e[0] !== e[0].toUpperCase() ? "on" + e[0].toUpperCase() + e.substring(1) : "on" + e), e
    }
    if (!(this instanceof t)) return new t(e, s);
    var g = {
        direction: "horizontal",
        touchEventsTarget: "container",
        initialSlide: 0,
        speed: 300,
        autoplay: !1,
        autoplayDisableOnInteraction: !0,
        autoplayStopOnLast: !1,
        iOSEdgeSwipeDetection: !1,
        iOSEdgeSwipeThreshold: 20,
        freeMode: !1,
        freeModeMomentum: !0,
        freeModeMomentumRatio: 1,
        freeModeMomentumBounce: !0,
        freeModeMomentumBounceRatio: 1,
        freeModeMomentumVelocityRatio: 1,
        freeModeSticky: !1,
        freeModeMinimumVelocity: .02,
        autoHeight: !1,
        setWrapperSize: !1,
        virtualTranslate: !1,
        effect: "slide",
        coverflow: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: !0
        },
        flip: {
          slideShadows: !0,
          limitRotation: !0
        },
        cube: {
          slideShadows: !0,
          shadow: !0,
          shadowOffset: 20,
          shadowScale: .94
        },
        fade: {
          crossFade: !1
        },
        parallax: !1,
        zoom: !1,
        zoomMax: 3,
        zoomMin: 1,
        zoomToggle: !0,
        scrollbar: null,
        scrollbarHide: !0,
        scrollbarDraggable: !1,
        scrollbarSnapOnRelease: !1,
        keyboardControl: !1,
        mousewheelControl: !1,
        mousewheelReleaseOnEdges: !1,
        mousewheelInvert: !1,
        mousewheelForceToAxis: !1,
        mousewheelSensitivity: 1,
        mousewheelEventsTarged: "container",
        hashnav: !1,
        hashnavWatchState: !1,
        history: !1,
        replaceState: !1,
        breakpoints: void 0,
        spaceBetween: 0,
        slidesPerView: 1,
        slidesPerColumn: 1,
        slidesPerColumnFill: "column",
        slidesPerGroup: 1,
        centeredSlides: !1,
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        roundLengths: !1,
        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: !0,
        shortSwipes: !0,
        longSwipes: !0,
        longSwipesRatio: .5,
        longSwipesMs: 300,
        followFinger: !0,
        onlyExternal: !1,
        threshold: 0,
        touchMoveStopPropagation: !0,
        touchReleaseOnEdges: !1,
        uniqueNavElements: !0,
        pagination: null,
        paginationElement: "span",
        paginationClickable: !1,
        paginationHide: !1,
        paginationBulletRender: null,
        paginationProgressRender: null,
        paginationFractionRender: null,
        paginationCustomRender: null,
        paginationType: "bullets",
        resistance: !0,
        resistanceRatio: .85,
        nextButton: null,
        prevButton: null,
        watchSlidesProgress: !1,
        watchSlidesVisibility: !1,
        grabCursor: !1,
        preventClicks: !0,
        preventClicksPropagation: !0,
        slideToClickedSlide: !1,
        lazyLoading: !1,
        lazyLoadingInPrevNext: !1,
        lazyLoadingInPrevNextAmount: 1,
        lazyLoadingOnTransitionStart: !1,
        preloadImages: !0,
        updateOnImagesReady: !0,
        loop: !1,
        loopAdditionalSlides: 0,
        loopedSlides: null,
        control: void 0,
        controlInverse: !1,
        controlBy: "slide",
        normalizeSlideIndex: !0,
        allowSwipeToPrev: !0,
        allowSwipeToNext: !0,
        swipeHandler: null,
        noSwiping: !0,
        noSwipingClass: "swiper-no-swiping",
        passiveListeners: !0,
        containerModifierClass: "swiper-container-",
        slideClass: "swiper-slide",
        slideActiveClass: "swiper-slide-active",
        slideDuplicateActiveClass: "swiper-slide-duplicate-active",
        slideVisibleClass: "swiper-slide-visible",
        slideDuplicateClass: "swiper-slide-duplicate",
        slideNextClass: "swiper-slide-next",
        slideDuplicateNextClass: "swiper-slide-duplicate-next",
        slidePrevClass: "swiper-slide-prev",
        slideDuplicatePrevClass: "swiper-slide-duplicate-prev",
        wrapperClass: "swiper-wrapper",
        bulletClass: "swiper-pagination-bullet",
        bulletActiveClass: "swiper-pagination-bullet-active",
        buttonDisabledClass: "swiper-button-disabled",
        paginationCurrentClass: "swiper-pagination-current",
        paginationTotalClass: "swiper-pagination-total",
        paginationHiddenClass: "swiper-pagination-hidden",
        paginationProgressbarClass: "swiper-pagination-progressbar",
        paginationClickableClass: "swiper-pagination-clickable",
        paginationModifierClass: "swiper-pagination-",
        lazyLoadingClass: "swiper-lazy",
        lazyStatusLoadingClass: "swiper-lazy-loading",
        lazyStatusLoadedClass: "swiper-lazy-loaded",
        lazyPreloaderClass: "swiper-lazy-preloader",
        notificationClass: "swiper-notification",
        preloaderClass: "preloader",
        zoomContainerClass: "swiper-zoom-container",
        observer: !1,
        observeParents: !1,
        a11y: !1,
        prevSlideMessage: "Previous slide",
        nextSlideMessage: "Next slide",
        firstSlideMessage: "This is the first slide",
        lastSlideMessage: "This is the last slide",
        paginationBulletMessage: "Go to slide {{index}}",
        runCallbacksOnInit: !0
      },
      h = s && s.virtualTranslate;
    s = s || {};
    var f = {};
    for (var v in s)
      if ("object" != typeof s[v] || null === s[v] || (s[v].nodeType || s[v] === window || s[v] === document || "undefined" != typeof Dom7 && s[v] instanceof Dom7 || "undefined" != typeof jQuery && s[v] instanceof jQuery)) f[v] = s[v];
      else {
        f[v] = {};
        for (var w in s[v]) f[v][w] = s[v][w]
      }
    for (var y in g)
      if ("undefined" == typeof s[y]) s[y] = g[y];
      else if ("object" == typeof s[y])
      for (var x in g[y]) "undefined" == typeof s[y][x] && (s[y][x] = g[y][x]);
    var T = this;
    if (T.params = s, T.originalParams = f, T.classNames = [], "undefined" != typeof a && "undefined" != typeof Dom7 && (a = Dom7), ("undefined" != typeof a || (a = "undefined" == typeof Dom7 ? window.Dom7 || window.Zepto || window.jQuery : Dom7)) && (T.$ = a, T.currentBreakpoint = void 0, T.getActiveBreakpoint = function () {
        if (!T.params.breakpoints) return !1;
        var e, a = !1,
          t = [];
        for (e in T.params.breakpoints) T.params.breakpoints.hasOwnProperty(e) && t.push(e);
        t.sort(function (e, a) {
          return parseInt(e, 10) > parseInt(a, 10)
        });
        for (var s = 0; s < t.length; s++) e = t[s], e >= window.innerWidth && !a && (a = e);
        return a || "max"
      }, T.setBreakpoint = function () {
        var e = T.getActiveBreakpoint();
        if (e && T.currentBreakpoint !== e) {
          var a = e in T.params.breakpoints ? T.params.breakpoints[e] : T.originalParams,
            t = T.params.loop && a.slidesPerView !== T.params.slidesPerView;
          for (var s in a) T.params[s] = a[s];
          T.currentBreakpoint = e, t && T.destroyLoop && T.reLoop(!0)
        }
      }, T.params.breakpoints && T.setBreakpoint(), T.container = a(e), 0 !== T.container.length)) {
      if (T.container.length > 1) {
        var b = [];
        return T.container.each(function () {
          b.push(new t(this, s))
        }), b
      }
      T.container[0].swiper = T, T.container.data("swiper", T), T.classNames.push(T.params.containerModifierClass + T.params.direction), T.params.freeMode && T.classNames.push(T.params.containerModifierClass + "free-mode"), T.support.flexbox || (T.classNames.push(T.params.containerModifierClass + "no-flexbox"), T.params.slidesPerColumn = 1), T.params.autoHeight && T.classNames.push(T.params.containerModifierClass + "autoheight"), (T.params.parallax || T.params.watchSlidesVisibility) && (T.params.watchSlidesProgress = !0), T.params.touchReleaseOnEdges && (T.params.resistanceRatio = 0), ["cube", "coverflow", "flip"].indexOf(T.params.effect) >= 0 && (T.support.transforms3d ? (T.params.watchSlidesProgress = !0, T.classNames.push(T.params.containerModifierClass + "3d")) : T.params.effect = "slide"), "slide" !== T.params.effect && T.classNames.push(T.params.containerModifierClass + T.params.effect), "cube" === T.params.effect && (T.params.resistanceRatio = 0, T.params.slidesPerView = 1, T.params.slidesPerColumn = 1, T.params.slidesPerGroup = 1, T.params.centeredSlides = !1, T.params.spaceBetween = 0, T.params.virtualTranslate = !0, T.params.setWrapperSize = !1), "fade" !== T.params.effect && "flip" !== T.params.effect || (T.params.slidesPerView = 1, T.params.slidesPerColumn = 1, T.params.slidesPerGroup = 1, T.params.watchSlidesProgress = !0, T.params.spaceBetween = 0, T.params.setWrapperSize = !1, "undefined" == typeof h && (T.params.virtualTranslate = !0)), T.params.grabCursor && T.support.touch && (T.params.grabCursor = !1), T.wrapper = T.container.children("." + T.params.wrapperClass), T.params.pagination && (T.paginationContainer = a(T.params.pagination), T.params.uniqueNavElements && "string" == typeof T.params.pagination && T.paginationContainer.length > 1 && 1 === T.container.find(T.params.pagination).length && (T.paginationContainer = T.container.find(T.params.pagination)), "bullets" === T.params.paginationType && T.params.paginationClickable ? T.paginationContainer.addClass(T.params.paginationModifierClass + "clickable") : T.params.paginationClickable = !1, T.paginationContainer.addClass(T.params.paginationModifierClass + T.params.paginationType)), (T.params.nextButton || T.params.prevButton) && (T.params.nextButton && (T.nextButton = a(T.params.nextButton), T.params.uniqueNavElements && "string" == typeof T.params.nextButton && T.nextButton.length > 1 && 1 === T.container.find(T.params.nextButton).length && (T.nextButton = T.container.find(T.params.nextButton))), T.params.prevButton && (T.prevButton = a(T.params.prevButton), T.params.uniqueNavElements && "string" == typeof T.params.prevButton && T.prevButton.length > 1 && 1 === T.container.find(T.params.prevButton).length && (T.prevButton = T.container.find(T.params.prevButton)))), T.isHorizontal = function () {
        return "horizontal" === T.params.direction
      }, T.rtl = T.isHorizontal() && ("rtl" === T.container[0].dir.toLowerCase() || "rtl" === T.container.css("direction")), T.rtl && T.classNames.push(T.params.containerModifierClass + "rtl"), T.rtl && (T.wrongRTL = "-webkit-box" === T.wrapper.css("display")), T.params.slidesPerColumn > 1 && T.classNames.push(T.params.containerModifierClass + "multirow"), T.device.android && T.classNames.push(T.params.containerModifierClass + "android"), T.container.addClass(T.classNames.join(" ")), T.translate = 0, T.progress = 0, T.velocity = 0, T.lockSwipeToNext = function () {
        T.params.allowSwipeToNext = !1, T.params.allowSwipeToPrev === !1 && T.params.grabCursor && T.unsetGrabCursor()
      }, T.lockSwipeToPrev = function () {
        T.params.allowSwipeToPrev = !1, T.params.allowSwipeToNext === !1 && T.params.grabCursor && T.unsetGrabCursor()
      }, T.lockSwipes = function () {
        T.params.allowSwipeToNext = T.params.allowSwipeToPrev = !1, T.params.grabCursor && T.unsetGrabCursor()
      }, T.unlockSwipeToNext = function () {
        T.params.allowSwipeToNext = !0, T.params.allowSwipeToPrev === !0 && T.params.grabCursor && T.setGrabCursor()
      }, T.unlockSwipeToPrev = function () {
        T.params.allowSwipeToPrev = !0, T.params.allowSwipeToNext === !0 && T.params.grabCursor && T.setGrabCursor()
      }, T.unlockSwipes = function () {
        T.params.allowSwipeToNext = T.params.allowSwipeToPrev = !0, T.params.grabCursor && T.setGrabCursor()
      }, T.setGrabCursor = function (e) {
        T.container[0].style.cursor = "move", T.container[0].style.cursor = e ? "-webkit-grabbing" : "-webkit-grab", T.container[0].style.cursor = e ? "-moz-grabbin" : "-moz-grab", T.container[0].style.cursor = e ? "grabbing" : "grab"
      }, T.unsetGrabCursor = function () {
        T.container[0].style.cursor = ""
      }, T.params.grabCursor && T.setGrabCursor(), T.imagesToLoad = [], T.imagesLoaded = 0, T.loadImage = function (e, a, t, s, r, i) {
        function n() {
          i && i()
        }
        var o;
        e.complete && r ? n() : a ? (o = new window.Image, o.onload = n, o.onerror = n, s && (o.sizes = s), t && (o.srcset = t), a && (o.src = a)) : n()
      }, T.preloadImages = function () {
        function e() {
          "undefined" != typeof T && null !== T && T && (void 0 !== T.imagesLoaded && T.imagesLoaded++, T.imagesLoaded === T.imagesToLoad.length && (T.params.updateOnImagesReady && T.update(), T.emit("onImagesReady", T)))
        }
        T.imagesToLoad = T.container.find("img");
        for (var a = 0; a < T.imagesToLoad.length; a++) T.loadImage(T.imagesToLoad[a], T.imagesToLoad[a].currentSrc || T.imagesToLoad[a].getAttribute("src"), T.imagesToLoad[a].srcset || T.imagesToLoad[a].getAttribute("srcset"), T.imagesToLoad[a].sizes || T.imagesToLoad[a].getAttribute("sizes"), !0, e)
      }, T.autoplayTimeoutId = void 0, T.autoplaying = !1, T.autoplayPaused = !1, T.startAutoplay = function () {
        return "undefined" == typeof T.autoplayTimeoutId && (!!T.params.autoplay && (!T.autoplaying && (T.autoplaying = !0, T.emit("onAutoplayStart", T), void i())))
      }, T.stopAutoplay = function (e) {
        T.autoplayTimeoutId && (T.autoplayTimeoutId && clearTimeout(T.autoplayTimeoutId), T.autoplaying = !1, T.autoplayTimeoutId = void 0, T.emit("onAutoplayStop", T))
      }, T.pauseAutoplay = function (e) {
        T.autoplayPaused || (T.autoplayTimeoutId && clearTimeout(T.autoplayTimeoutId), T.autoplayPaused = !0, 0 === e ? (T.autoplayPaused = !1, i()) : T.wrapper.transitionEnd(function () {
          T && (T.autoplayPaused = !1, T.autoplaying ? i() : T.stopAutoplay())
        }))
      }, T.minTranslate = function () {
        return -T.snapGrid[0]
      }, T.maxTranslate = function () {
        return -T.snapGrid[T.snapGrid.length - 1]
      }, T.updateAutoHeight = function () {
        var e, a = [],
          t = 0;
        if ("auto" !== T.params.slidesPerView && T.params.slidesPerView > 1)
          for (e = 0; e < Math.ceil(T.params.slidesPerView); e++) {
            var s = T.activeIndex + e;
            if (s > T.slides.length) break;
            a.push(T.slides.eq(s)[0])
          } else a.push(T.slides.eq(T.activeIndex)[0]);
        for (e = 0; e < a.length; e++)
          if ("undefined" != typeof a[e]) {
            var r = a[e].offsetHeight;
            t = r > t ? r : t
          }
        t && T.wrapper.css("height", t + "px")
      }, T.updateContainerSize = function () {
        var e, a;
        e = "undefined" != typeof T.params.width ? T.params.width : T.container[0].clientWidth, a = "undefined" != typeof T.params.height ? T.params.height : T.container[0].clientHeight, 0 === e && T.isHorizontal() || 0 === a && !T.isHorizontal() || (e = e - parseInt(T.container.css("padding-left"), 10) - parseInt(T.container.css("padding-right"), 10), a = a - parseInt(T.container.css("padding-top"), 10) - parseInt(T.container.css("padding-bottom"), 10), T.width = e, T.height = a, T.size = T.isHorizontal() ? T.width : T.height)
      }, T.updateSlidesSize = function () {
        T.slides = T.wrapper.children("." + T.params.slideClass), T.snapGrid = [], T.slidesGrid = [], T.slidesSizesGrid = [];
        var e, a = T.params.spaceBetween,
          t = -T.params.slidesOffsetBefore,
          s = 0,
          i = 0;
        if ("undefined" != typeof T.size) {
          "string" == typeof a && a.indexOf("%") >= 0 && (a = parseFloat(a.replace("%", "")) / 100 * T.size), T.virtualSize = -a, T.rtl ? T.slides.css({
            marginLeft: "",
            marginTop: ""
          }) : T.slides.css({
            marginRight: "",
            marginBottom: ""
          });
          var n;
          T.params.slidesPerColumn > 1 && (n = Math.floor(T.slides.length / T.params.slidesPerColumn) === T.slides.length / T.params.slidesPerColumn ? T.slides.length : Math.ceil(T.slides.length / T.params.slidesPerColumn) * T.params.slidesPerColumn, "auto" !== T.params.slidesPerView && "row" === T.params.slidesPerColumnFill && (n = Math.max(n, T.params.slidesPerView * T.params.slidesPerColumn)));
          var o, l = T.params.slidesPerColumn,
            p = n / l,
            d = p - (T.params.slidesPerColumn * p - T.slides.length);
          for (e = 0; e < T.slides.length; e++) {
            o = 0;
            var u = T.slides.eq(e);
            if (T.params.slidesPerColumn > 1) {
              var m, c, g;
              "column" === T.params.slidesPerColumnFill ? (c = Math.floor(e / l), g = e - c * l, (c > d || c === d && g === l - 1) && ++g >= l && (g = 0, c++), m = c + g * n / l, u.css({
                "-webkit-box-ordinal-group": m,
                "-moz-box-ordinal-group": m,
                "-ms-flex-order": m,
                "-webkit-order": m,
                order: m
              })) : (g = Math.floor(e / p), c = e - g * p), u.css("margin-" + (T.isHorizontal() ? "top" : "left"), 0 !== g && T.params.spaceBetween && T.params.spaceBetween + "px").attr("data-swiper-column", c).attr("data-swiper-row", g)
            }
            "none" !== u.css("display") && ("auto" === T.params.slidesPerView ? (o = T.isHorizontal() ? u.outerWidth(!0) : u.outerHeight(!0), T.params.roundLengths && (o = r(o))) : (o = (T.size - (T.params.slidesPerView - 1) * a) / T.params.slidesPerView, T.params.roundLengths && (o = r(o)), T.isHorizontal() ? T.slides[e].style.width = o + "px" : T.slides[e].style.height = o + "px"), T.slides[e].swiperSlideSize = o, T.slidesSizesGrid.push(o), T.params.centeredSlides ? (t = t + o / 2 + s / 2 + a, 0 === e && (t = t - T.size / 2 - a), Math.abs(t) < .001 && (t = 0), i % T.params.slidesPerGroup === 0 && T.snapGrid.push(t), T.slidesGrid.push(t)) : (i % T.params.slidesPerGroup === 0 && T.snapGrid.push(t), T.slidesGrid.push(t), t = t + o + a), T.virtualSize += o + a, s = o, i++)
          }
          T.virtualSize = Math.max(T.virtualSize, T.size) + T.params.slidesOffsetAfter;
          var h;
          if (T.rtl && T.wrongRTL && ("slide" === T.params.effect || "coverflow" === T.params.effect) && T.wrapper.css({
              width: T.virtualSize + T.params.spaceBetween + "px"
            }), T.support.flexbox && !T.params.setWrapperSize || (T.isHorizontal() ? T.wrapper.css({
              width: T.virtualSize + T.params.spaceBetween + "px"
            }) : T.wrapper.css({
              height: T.virtualSize + T.params.spaceBetween + "px"
            })), T.params.slidesPerColumn > 1 && (T.virtualSize = (o + T.params.spaceBetween) * n, T.virtualSize = Math.ceil(T.virtualSize / T.params.slidesPerColumn) - T.params.spaceBetween, T.isHorizontal() ? T.wrapper.css({
              width: T.virtualSize + T.params.spaceBetween + "px"
            }) : T.wrapper.css({
              height: T.virtualSize + T.params.spaceBetween + "px"
            }), T.params.centeredSlides)) {
            for (h = [], e = 0; e < T.snapGrid.length; e++) T.snapGrid[e] < T.virtualSize + T.snapGrid[0] && h.push(T.snapGrid[e]);
            T.snapGrid = h
          }
          if (!T.params.centeredSlides) {
            for (h = [], e = 0; e < T.snapGrid.length; e++) T.snapGrid[e] <= T.virtualSize - T.size && h.push(T.snapGrid[e]);
            T.snapGrid = h, Math.floor(T.virtualSize - T.size) - Math.floor(T.snapGrid[T.snapGrid.length - 1]) > 1 && T.snapGrid.push(T.virtualSize - T.size)
          }
          0 === T.snapGrid.length && (T.snapGrid = [0]), 0 !== T.params.spaceBetween && (T.isHorizontal() ? T.rtl ? T.slides.css({
            marginLeft: a + "px"
          }) : T.slides.css({
            marginRight: a + "px"
          }) : T.slides.css({
            marginBottom: a + "px"
          })), T.params.watchSlidesProgress && T.updateSlidesOffset()
        }
      }, T.updateSlidesOffset = function () {
        for (var e = 0; e < T.slides.length; e++) T.slides[e].swiperSlideOffset = T.isHorizontal() ? T.slides[e].offsetLeft : T.slides[e].offsetTop
      }, T.currentSlidesPerView = function () {
        var e, a, t = 1;
        if (T.params.centeredSlides) {
          var s, r = T.slides[T.activeIndex].swiperSlideSize;
          for (e = T.activeIndex + 1; e < T.slides.length; e++) T.slides[e] && !s && (r += T.slides[e].swiperSlideSize, t++, r > T.size && (s = !0));
          for (a = T.activeIndex - 1; a >= 0; a--) T.slides[a] && !s && (r += T.slides[a].swiperSlideSize, t++, r > T.size && (s = !0))
        } else
          for (e = T.activeIndex + 1; e < T.slides.length; e++) T.slidesGrid[e] - T.slidesGrid[T.activeIndex] < T.size && t++;
        return t
      }, T.updateSlidesProgress = function (e) {
        if ("undefined" == typeof e && (e = T.translate || 0), 0 !== T.slides.length) {
          "undefined" == typeof T.slides[0].swiperSlideOffset && T.updateSlidesOffset();
          var a = -e;
          T.rtl && (a = e), T.slides.removeClass(T.params.slideVisibleClass);
          for (var t = 0; t < T.slides.length; t++) {
            var s = T.slides[t],
              r = (a + (T.params.centeredSlides ? T.minTranslate() : 0) - s.swiperSlideOffset) / (s.swiperSlideSize + T.params.spaceBetween);
            if (T.params.watchSlidesVisibility) {
              var i = -(a - s.swiperSlideOffset),
                n = i + T.slidesSizesGrid[t],
                o = i >= 0 && i < T.size || n > 0 && n <= T.size || i <= 0 && n >= T.size;
              o && T.slides.eq(t).addClass(T.params.slideVisibleClass)
            }
            s.progress = T.rtl ? -r : r
          }
        }
      }, T.updateProgress = function (e) {
        "undefined" == typeof e && (e = T.translate || 0);
        var a = T.maxTranslate() - T.minTranslate(),
          t = T.isBeginning,
          s = T.isEnd;
        0 === a ? (T.progress = 0, T.isBeginning = T.isEnd = !0) : (T.progress = (e - T.minTranslate()) / a, T.isBeginning = T.progress <= 0, T.isEnd = T.progress >= 1), T.isBeginning && !t && T.emit("onReachBeginning", T), T.isEnd && !s && T.emit("onReachEnd", T), T.params.watchSlidesProgress && T.updateSlidesProgress(e), T.emit("onProgress", T, T.progress)
      }, T.updateActiveIndex = function () {
        var e, a, t, s = T.rtl ? T.translate : -T.translate;
        for (a = 0; a < T.slidesGrid.length; a++) "undefined" != typeof T.slidesGrid[a + 1] ? s >= T.slidesGrid[a] && s < T.slidesGrid[a + 1] - (T.slidesGrid[a + 1] - T.slidesGrid[a]) / 2 ? e = a : s >= T.slidesGrid[a] && s < T.slidesGrid[a + 1] && (e = a + 1) : s >= T.slidesGrid[a] && (e = a);
        T.params.normalizeSlideIndex && (e < 0 || "undefined" == typeof e) && (e = 0), t = Math.floor(e / T.params.slidesPerGroup), t >= T.snapGrid.length && (t = T.snapGrid.length - 1), e !== T.activeIndex && (T.snapIndex = t, T.previousIndex = T.activeIndex, T.activeIndex = e, T.updateClasses(), T.updateRealIndex())
      }, T.updateRealIndex = function () {
        T.realIndex = parseInt(T.slides.eq(T.activeIndex).attr("data-swiper-slide-index") || T.activeIndex, 10)
      }, T.updateClasses = function () {
        T.slides.removeClass(T.params.slideActiveClass + " " + T.params.slideNextClass + " " + T.params.slidePrevClass + " " + T.params.slideDuplicateActiveClass + " " + T.params.slideDuplicateNextClass + " " + T.params.slideDuplicatePrevClass);
        var e = T.slides.eq(T.activeIndex);
        e.addClass(T.params.slideActiveClass), s.loop && (e.hasClass(T.params.slideDuplicateClass) ? T.wrapper.children("." + T.params.slideClass + ":not(." + T.params.slideDuplicateClass + ')[data-swiper-slide-index="' + T.realIndex + '"]').addClass(T.params.slideDuplicateActiveClass) : T.wrapper.children("." + T.params.slideClass + "." + T.params.slideDuplicateClass + '[data-swiper-slide-index="' + T.realIndex + '"]').addClass(T.params.slideDuplicateActiveClass));
        var t = e.next("." + T.params.slideClass).addClass(T.params.slideNextClass);
        T.params.loop && 0 === t.length && (t = T.slides.eq(0), t.addClass(T.params.slideNextClass));
        var r = e.prev("." + T.params.slideClass).addClass(T.params.slidePrevClass);
        if (T.params.loop && 0 === r.length && (r = T.slides.eq(-1), r.addClass(T.params.slidePrevClass)), s.loop && (t.hasClass(T.params.slideDuplicateClass) ? T.wrapper.children("." + T.params.slideClass + ":not(." + T.params.slideDuplicateClass + ')[data-swiper-slide-index="' + t.attr("data-swiper-slide-index") + '"]').addClass(T.params.slideDuplicateNextClass) : T.wrapper.children("." + T.params.slideClass + "." + T.params.slideDuplicateClass + '[data-swiper-slide-index="' + t.attr("data-swiper-slide-index") + '"]').addClass(T.params.slideDuplicateNextClass), r.hasClass(T.params.slideDuplicateClass) ? T.wrapper.children("." + T.params.slideClass + ":not(." + T.params.slideDuplicateClass + ')[data-swiper-slide-index="' + r.attr("data-swiper-slide-index") + '"]').addClass(T.params.slideDuplicatePrevClass) : T.wrapper.children("." + T.params.slideClass + "." + T.params.slideDuplicateClass + '[data-swiper-slide-index="' + r.attr("data-swiper-slide-index") + '"]').addClass(T.params.slideDuplicatePrevClass)), T.paginationContainer && T.paginationContainer.length > 0) {
          var i, n = T.params.loop ? Math.ceil((T.slides.length - 2 * T.loopedSlides) / T.params.slidesPerGroup) : T.snapGrid.length;
          if (T.params.loop ? (i = Math.ceil((T.activeIndex - T.loopedSlides) / T.params.slidesPerGroup), i > T.slides.length - 1 - 2 * T.loopedSlides && (i -= T.slides.length - 2 * T.loopedSlides), i > n - 1 && (i -= n), i < 0 && "bullets" !== T.params.paginationType && (i = n + i)) : i = "undefined" != typeof T.snapIndex ? T.snapIndex : T.activeIndex || 0, "bullets" === T.params.paginationType && T.bullets && T.bullets.length > 0 && (T.bullets.removeClass(T.params.bulletActiveClass), T.paginationContainer.length > 1 ? T.bullets.each(function () {
              a(this).index() === i && a(this).addClass(T.params.bulletActiveClass)
            }) : T.bullets.eq(i).addClass(T.params.bulletActiveClass)), "fraction" === T.params.paginationType && (T.paginationContainer.find("." + T.params.paginationCurrentClass).text(i + 1), T.paginationContainer.find("." + T.params.paginationTotalClass).text(n)), "progress" === T.params.paginationType) {
            var o = (i + 1) / n,
              l = o,
              p = 1;
            T.isHorizontal() || (p = o, l = 1), T.paginationContainer.find("." + T.params.paginationProgressbarClass).transform("translate3d(0,0,0) scaleX(" + l + ") scaleY(" + p + ")").transition(T.params.speed)
          }
          "custom" === T.params.paginationType && T.params.paginationCustomRender && (T.paginationContainer.html(T.params.paginationCustomRender(T, i + 1, n)), T.emit("onPaginationRendered", T, T.paginationContainer[0]))
        }
        T.params.loop || (T.params.prevButton && T.prevButton && T.prevButton.length > 0 && (T.isBeginning ? (T.prevButton.addClass(T.params.buttonDisabledClass), T.params.a11y && T.a11y && T.a11y.disable(T.prevButton)) : (T.prevButton.removeClass(T.params.buttonDisabledClass), T.params.a11y && T.a11y && T.a11y.enable(T.prevButton))), T.params.nextButton && T.nextButton && T.nextButton.length > 0 && (T.isEnd ? (T.nextButton.addClass(T.params.buttonDisabledClass), T.params.a11y && T.a11y && T.a11y.disable(T.nextButton)) : (T.nextButton.removeClass(T.params.buttonDisabledClass), T.params.a11y && T.a11y && T.a11y.enable(T.nextButton))))
      }, T.updatePagination = function () {
        if (T.params.pagination && T.paginationContainer && T.paginationContainer.length > 0) {
          var e = "";
          if ("bullets" === T.params.paginationType) {
            for (var a = T.params.loop ? Math.ceil((T.slides.length - 2 * T.loopedSlides) / T.params.slidesPerGroup) : T.snapGrid.length, t = 0; t < a; t++) e += T.params.paginationBulletRender ? T.params.paginationBulletRender(T, t, T.params.bulletClass) : "<" + T.params.paginationElement + ' class="{$maccms.cache_flag} ' + T.params.bulletClass + '"></' + T.params.paginationElement + ">";
            T.paginationContainer.html(e), T.bullets = T.paginationContainer.find("." + T.params.bulletClass), T.params.paginationClickable && T.params.a11y && T.a11y && T.a11y.initPagination()
          }
          "fraction" === T.params.paginationType && (e = T.params.paginationFractionRender ? T.params.paginationFractionRender(T, T.params.paginationCurrentClass, T.params.paginationTotalClass) : '<span class="{$maccms.cache_flag} ' + T.params.paginationCurrentClass + '"></span> / <span class="{$maccms.cache_flag} ' + T.params.paginationTotalClass + '"></span>', T.paginationContainer.html(e)), "progress" === T.params.paginationType && (e = T.params.paginationProgressRender ? T.params.paginationProgressRender(T, T.params.paginationProgressbarClass) : '<span class="{$maccms.cache_flag} ' + T.params.paginationProgressbarClass + '"></span>', T.paginationContainer.html(e)), "custom" !== T.params.paginationType && T.emit("onPaginationRendered", T, T.paginationContainer[0])
        }
      }, T.update = function (e) {
        function a() {
          T.rtl ? -T.translate : T.translate;
          s = Math.min(Math.max(T.translate, T.maxTranslate()), T.minTranslate()), T.setWrapperTranslate(s), T.updateActiveIndex(), T.updateClasses()
        }
        if (T)
          if (T.updateContainerSize(), T.updateSlidesSize(), T.updateProgress(), T.updatePagination(), T.updateClasses(), T.params.scrollbar && T.scrollbar && T.scrollbar.set(), e) {
            var t, s;
            T.controller && T.controller.spline && (T.controller.spline = void 0), T.params.freeMode ? (a(), T.params.autoHeight && T.updateAutoHeight()) : (t = ("auto" === T.params.slidesPerView || T.params.slidesPerView > 1) && T.isEnd && !T.params.centeredSlides ? T.slideTo(T.slides.length - 1, 0, !1, !0) : T.slideTo(T.activeIndex, 0, !1, !0), t || a())
          } else T.params.autoHeight && T.updateAutoHeight()
      }, T.onResize = function (e) {
        T.params.breakpoints && T.setBreakpoint();
        var a = T.params.allowSwipeToPrev,
          t = T.params.allowSwipeToNext;
        T.params.allowSwipeToPrev = T.params.allowSwipeToNext = !0, T.updateContainerSize(), T.updateSlidesSize(), ("auto" === T.params.slidesPerView || T.params.freeMode || e) && T.updatePagination(), T.params.scrollbar && T.scrollbar && T.scrollbar.set(), T.controller && T.controller.spline && (T.controller.spline = void 0);
        var s = !1;
        if (T.params.freeMode) {
          var r = Math.min(Math.max(T.translate, T.maxTranslate()), T.minTranslate());
          T.setWrapperTranslate(r), T.updateActiveIndex(), T.updateClasses(), T.params.autoHeight && T.updateAutoHeight()
        } else T.updateClasses(), s = ("auto" === T.params.slidesPerView || T.params.slidesPerView > 1) && T.isEnd && !T.params.centeredSlides ? T.slideTo(T.slides.length - 1, 0, !1, !0) : T.slideTo(T.activeIndex, 0, !1, !0);
        T.params.lazyLoading && !s && T.lazy && T.lazy.load(), T.params.allowSwipeToPrev = a, T.params.allowSwipeToNext = t
      }, T.touchEventsDesktop = {
        start: "mousedown",
        move: "mousemove",
        end: "mouseup"
      }, window.navigator.pointerEnabled ? T.touchEventsDesktop = {
        start: "pointerdown",
        move: "pointermove",
        end: "pointerup"
      } : window.navigator.msPointerEnabled && (T.touchEventsDesktop = {
        start: "MSPointerDown",
        move: "MSPointerMove",
        end: "MSPointerUp"
      }), T.touchEvents = {
        start: T.support.touch || !T.params.simulateTouch ? "touchstart" : T.touchEventsDesktop.start,
        move: T.support.touch || !T.params.simulateTouch ? "touchmove" : T.touchEventsDesktop.move,
        end: T.support.touch || !T.params.simulateTouch ? "touchend" : T.touchEventsDesktop.end
      }, (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) && ("container" === T.params.touchEventsTarget ? T.container : T.wrapper).addClass("swiper-wp8-" + T.params.direction), T.initEvents = function (e) {
        var a = e ? "off" : "on",
          t = e ? "removeEventListener" : "addEventListener",
          r = "container" === T.params.touchEventsTarget ? T.container[0] : T.wrapper[0],
          i = T.support.touch ? r : document,
          n = !!T.params.nested;
        if (T.browser.ie) r[t](T.touchEvents.start, T.onTouchStart, !1), i[t](T.touchEvents.move, T.onTouchMove, n), i[t](T.touchEvents.end, T.onTouchEnd, !1);
        else {
          if (T.support.touch) {
            var o = !("touchstart" !== T.touchEvents.start || !T.support.passiveListener || !T.params.passiveListeners) && {
              passive: !0,
              capture: !1
            };
            r[t](T.touchEvents.start, T.onTouchStart, o), r[t](T.touchEvents.move, T.onTouchMove, n), r[t](T.touchEvents.end, T.onTouchEnd, o)
          }(s.simulateTouch && !T.device.ios && !T.device.android || s.simulateTouch && !T.support.touch && T.device.ios) && (r[t]("mousedown", T.onTouchStart, !1), document[t]("mousemove", T.onTouchMove, n), document[t]("mouseup", T.onTouchEnd, !1))
        }
        window[t]("resize", T.onResize), T.params.nextButton && T.nextButton && T.nextButton.length > 0 && (T.nextButton[a]("click", T.onClickNext), T.params.a11y && T.a11y && T.nextButton[a]("keydown", T.a11y.onEnterKey)), T.params.prevButton && T.prevButton && T.prevButton.length > 0 && (T.prevButton[a]("click", T.onClickPrev), T.params.a11y && T.a11y && T.prevButton[a]("keydown", T.a11y.onEnterKey)), T.params.pagination && T.params.paginationClickable && (T.paginationContainer[a]("click", "." + T.params.bulletClass, T.onClickIndex), T.params.a11y && T.a11y && T.paginationContainer[a]("keydown", "." + T.params.bulletClass, T.a11y.onEnterKey)), (T.params.preventClicks || T.params.preventClicksPropagation) && r[t]("click", T.preventClicks, !0);
      }, T.attachEvents = function () {
        T.initEvents()
      }, T.detachEvents = function () {
        T.initEvents(!0)
      }, T.allowClick = !0, T.preventClicks = function (e) {
        T.allowClick || (T.params.preventClicks && e.preventDefault(), T.params.preventClicksPropagation && T.animating && (e.stopPropagation(), e.stopImmediatePropagation()))
      }, T.onClickNext = function (e) {
        e.preventDefault(), T.isEnd && !T.params.loop || T.slideNext()
      }, T.onClickPrev = function (e) {
        e.preventDefault(), T.isBeginning && !T.params.loop || T.slidePrev()
      }, T.onClickIndex = function (e) {
        e.preventDefault();
        var t = a(this).index() * T.params.slidesPerGroup;
        T.params.loop && (t += T.loopedSlides), T.slideTo(t)
      }, T.updateClickedSlide = function (e) {
        var t = n(e, "." + T.params.slideClass),
          s = !1;
        if (t)
          for (var r = 0; r < T.slides.length; r++) T.slides[r] === t && (s = !0);
        if (!t || !s) return T.clickedSlide = void 0, void(T.clickedIndex = void 0);
        if (T.clickedSlide = t, T.clickedIndex = a(t).index(), T.params.slideToClickedSlide && void 0 !== T.clickedIndex && T.clickedIndex !== T.activeIndex) {
          var i, o = T.clickedIndex,
            l = "auto" === T.params.slidesPerView ? T.currentSlidesPerView() : T.params.slidesPerView;
          if (T.params.loop) {
            if (T.animating) return;
            i = parseInt(a(T.clickedSlide).attr("data-swiper-slide-index"), 10), T.params.centeredSlides ? o < T.loopedSlides - l / 2 || o > T.slides.length - T.loopedSlides + l / 2 ? (T.fixLoop(), o = T.wrapper.children("." + T.params.slideClass + '[data-swiper-slide-index="' + i + '"]:not(.' + T.params.slideDuplicateClass + ")").eq(0).index(), setTimeout(function () {
              T.slideTo(o)
            }, 0)) : T.slideTo(o) : o > T.slides.length - l ? (T.fixLoop(), o = T.wrapper.children("." + T.params.slideClass + '[data-swiper-slide-index="' + i + '"]:not(.' + T.params.slideDuplicateClass + ")").eq(0).index(), setTimeout(function () {
              T.slideTo(o)
            }, 0)) : T.slideTo(o)
          } else T.slideTo(o)
        }
      };
      var S, C, z, M, P, E, I, k, D, L, B = "input, select, textarea, button, video",
        H = Date.now(),
        G = [];
      T.animating = !1, T.touches = {
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        diff: 0
      };
      var X, Y;
      T.onTouchStart = function (e) {
        if (e.originalEvent && (e = e.originalEvent), X = "touchstart" === e.type, X || !("which" in e) || 3 !== e.which) {
          if (T.params.noSwiping && n(e, "." + T.params.noSwipingClass)) return void(T.allowClick = !0);
          if (!T.params.swipeHandler || n(e, T.params.swipeHandler)) {
            var t = T.touches.currentX = "touchstart" === e.type ? e.targetTouches[0].pageX : e.pageX,
              s = T.touches.currentY = "touchstart" === e.type ? e.targetTouches[0].pageY : e.pageY;
            if (!(T.device.ios && T.params.iOSEdgeSwipeDetection && t <= T.params.iOSEdgeSwipeThreshold)) {
              if (S = !0, C = !1, z = !0, P = void 0, Y = void 0, T.touches.startX = t, T.touches.startY = s, M = Date.now(), T.allowClick = !0, T.updateContainerSize(), T.swipeDirection = void 0, T.params.threshold > 0 && (k = !1), "touchstart" !== e.type) {
                var r = !0;
                a(e.target).is(B) && (r = !1), document.activeElement && a(document.activeElement).is(B) && document.activeElement.blur(), r && e.preventDefault()
              }
              T.emit("onTouchStart", T, e)
            }
          }
        }
      }, T.onTouchMove = function (e) {
        if (e.originalEvent && (e = e.originalEvent), !X || "mousemove" !== e.type) {
          if (e.preventedByNestedSwiper) return T.touches.startX = "touchmove" === e.type ? e.targetTouches[0].pageX : e.pageX, void(T.touches.startY = "touchmove" === e.type ? e.targetTouches[0].pageY : e.pageY);
          if (T.params.onlyExternal) return T.allowClick = !1, void(S && (T.touches.startX = T.touches.currentX = "touchmove" === e.type ? e.targetTouches[0].pageX : e.pageX, T.touches.startY = T.touches.currentY = "touchmove" === e.type ? e.targetTouches[0].pageY : e.pageY, M = Date.now()));
          if (X && T.params.touchReleaseOnEdges && !T.params.loop)
            if (T.isHorizontal()) {
              if (T.touches.currentX < T.touches.startX && T.translate <= T.maxTranslate() || T.touches.currentX > T.touches.startX && T.translate >= T.minTranslate()) return
            } else if (T.touches.currentY < T.touches.startY && T.translate <= T.maxTranslate() || T.touches.currentY > T.touches.startY && T.translate >= T.minTranslate()) return;
          if (X && document.activeElement && e.target === document.activeElement && a(e.target).is(B)) return C = !0, void(T.allowClick = !1);
          if (z && T.emit("onTouchMove", T, e), !(e.targetTouches && e.targetTouches.length > 1)) {
            if (T.touches.currentX = "touchmove" === e.type ? e.targetTouches[0].pageX : e.pageX, T.touches.currentY = "touchmove" === e.type ? e.targetTouches[0].pageY : e.pageY, "undefined" == typeof P) {
              var t;
              T.isHorizontal() && T.touches.currentY === T.touches.startY || !T.isHorizontal() && T.touches.currentX === T.touches.startX ? P = !1 : (t = 180 * Math.atan2(Math.abs(T.touches.currentY - T.touches.startY), Math.abs(T.touches.currentX - T.touches.startX)) / Math.PI, P = T.isHorizontal() ? t > T.params.touchAngle : 90 - t > T.params.touchAngle)
            }
            if (P && T.emit("onTouchMoveOpposite", T, e), "undefined" == typeof Y && T.browser.ieTouch && (T.touches.currentX === T.touches.startX && T.touches.currentY === T.touches.startY || (Y = !0)), S) {
              if (P) return void(S = !1);
              if (Y || !T.browser.ieTouch) {
                T.allowClick = !1, T.emit("onSliderMove", T, e), e.preventDefault(), T.params.touchMoveStopPropagation && !T.params.nested && e.stopPropagation(), C || (s.loop && T.fixLoop(), I = T.getWrapperTranslate(), T.setWrapperTransition(0), T.animating && T.wrapper.trigger("webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd"), T.params.autoplay && T.autoplaying && (T.params.autoplayDisableOnInteraction ? T.stopAutoplay() : T.pauseAutoplay()), L = !1, !T.params.grabCursor || T.params.allowSwipeToNext !== !0 && T.params.allowSwipeToPrev !== !0 || T.setGrabCursor(!0)), C = !0;
                var r = T.touches.diff = T.isHorizontal() ? T.touches.currentX - T.touches.startX : T.touches.currentY - T.touches.startY;
                r *= T.params.touchRatio, T.rtl && (r = -r), T.swipeDirection = r > 0 ? "prev" : "next", E = r + I;
                var i = !0;
                if (r > 0 && E > T.minTranslate() ? (i = !1, T.params.resistance && (E = T.minTranslate() - 1 + Math.pow(-T.minTranslate() + I + r, T.params.resistanceRatio))) : r < 0 && E < T.maxTranslate() && (i = !1, T.params.resistance && (E = T.maxTranslate() + 1 - Math.pow(T.maxTranslate() - I - r, T.params.resistanceRatio))), i && (e.preventedByNestedSwiper = !0), !T.params.allowSwipeToNext && "next" === T.swipeDirection && E < I && (E = I), !T.params.allowSwipeToPrev && "prev" === T.swipeDirection && E > I && (E = I), T.params.threshold > 0) {
                  if (!(Math.abs(r) > T.params.threshold || k)) return void(E = I);
                  if (!k) return k = !0, T.touches.startX = T.touches.currentX, T.touches.startY = T.touches.currentY, E = I, void(T.touches.diff = T.isHorizontal() ? T.touches.currentX - T.touches.startX : T.touches.currentY - T.touches.startY)
                }
                T.params.followFinger && ((T.params.freeMode || T.params.watchSlidesProgress) && T.updateActiveIndex(), T.params.freeMode && (0 === G.length && G.push({
                  position: T.touches[T.isHorizontal() ? "startX" : "startY"],
                  time: M
                }), G.push({
                  position: T.touches[T.isHorizontal() ? "currentX" : "currentY"],
                  time: (new window.Date).getTime()
                })), T.updateProgress(E), T.setWrapperTranslate(E))
              }
            }
          }
        }
      }, T.onTouchEnd = function (e) {
        if (e.originalEvent && (e = e.originalEvent), z && T.emit("onTouchEnd", T, e), z = !1, S) {
          T.params.grabCursor && C && S && (T.params.allowSwipeToNext === !0 || T.params.allowSwipeToPrev === !0) && T.setGrabCursor(!1);
          var t = Date.now(),
            s = t - M;
          if (T.allowClick && (T.updateClickedSlide(e), T.emit("onTap", T, e), s < 300 && t - H > 300 && (D && clearTimeout(D), D = setTimeout(function () {
              T && (T.params.paginationHide && T.paginationContainer.length > 0 && !a(e.target).hasClass(T.params.bulletClass) && T.paginationContainer.toggleClass(T.params.paginationHiddenClass), T.emit("onClick", T, e))
            }, 300)), s < 300 && t - H < 300 && (D && clearTimeout(D), T.emit("onDoubleTap", T, e))), H = Date.now(), setTimeout(function () {
              T && (T.allowClick = !0)
            }, 0), !S || !C || !T.swipeDirection || 0 === T.touches.diff || E === I) return void(S = C = !1);
          S = C = !1;
          var r;
          if (r = T.params.followFinger ? T.rtl ? T.translate : -T.translate : -E, T.params.freeMode) {
            if (r < -T.minTranslate()) return void T.slideTo(T.activeIndex);
            if (r > -T.maxTranslate()) return void(T.slides.length < T.snapGrid.length ? T.slideTo(T.snapGrid.length - 1) : T.slideTo(T.slides.length - 1));
            if (T.params.freeModeMomentum) {
              if (G.length > 1) {
                var i = G.pop(),
                  n = G.pop(),
                  o = i.position - n.position,
                  l = i.time - n.time;
                T.velocity = o / l, T.velocity = T.velocity / 2, Math.abs(T.velocity) < T.params.freeModeMinimumVelocity && (T.velocity = 0), (l > 150 || (new window.Date).getTime() - i.time > 300) && (T.velocity = 0)
              } else T.velocity = 0;
              T.velocity = T.velocity * T.params.freeModeMomentumVelocityRatio, G.length = 0;
              var p = 1e3 * T.params.freeModeMomentumRatio,
                d = T.velocity * p,
                u = T.translate + d;
              T.rtl && (u = -u);
              var m, c = !1,
                g = 20 * Math.abs(T.velocity) * T.params.freeModeMomentumBounceRatio;
              if (u < T.maxTranslate()) T.params.freeModeMomentumBounce ? (u + T.maxTranslate() < -g && (u = T.maxTranslate() - g), m = T.maxTranslate(), c = !0, L = !0) : u = T.maxTranslate();
              else if (u > T.minTranslate()) T.params.freeModeMomentumBounce ? (u - T.minTranslate() > g && (u = T.minTranslate() + g), m = T.minTranslate(), c = !0, L = !0) : u = T.minTranslate();
              else if (T.params.freeModeSticky) {
                var h, f = 0;
                for (f = 0; f < T.snapGrid.length; f += 1)
                  if (T.snapGrid[f] > -u) {
                    h = f;
                    break
                  }
                u = Math.abs(T.snapGrid[h] - u) < Math.abs(T.snapGrid[h - 1] - u) || "next" === T.swipeDirection ? T.snapGrid[h] : T.snapGrid[h - 1], T.rtl || (u = -u)
              }
              if (0 !== T.velocity) p = T.rtl ? Math.abs((-u - T.translate) / T.velocity) : Math.abs((u - T.translate) / T.velocity);
              else if (T.params.freeModeSticky) return void T.slideReset();
              T.params.freeModeMomentumBounce && c ? (T.updateProgress(m), T.setWrapperTransition(p), T.setWrapperTranslate(u), T.onTransitionStart(), T.animating = !0, T.wrapper.transitionEnd(function () {
                T && L && (T.emit("onMomentumBounce", T), T.setWrapperTransition(T.params.speed), T.setWrapperTranslate(m), T.wrapper.transitionEnd(function () {
                  T && T.onTransitionEnd()
                }))
              })) : T.velocity ? (T.updateProgress(u), T.setWrapperTransition(p), T.setWrapperTranslate(u), T.onTransitionStart(), T.animating || (T.animating = !0, T.wrapper.transitionEnd(function () {
                T && T.onTransitionEnd()
              }))) : T.updateProgress(u), T.updateActiveIndex()
            }
            return void((!T.params.freeModeMomentum || s >= T.params.longSwipesMs) && (T.updateProgress(), T.updateActiveIndex()))
          }
          var v, w = 0,
            y = T.slidesSizesGrid[0];
          for (v = 0; v < T.slidesGrid.length; v += T.params.slidesPerGroup) "undefined" != typeof T.slidesGrid[v + T.params.slidesPerGroup] ? r >= T.slidesGrid[v] && r < T.slidesGrid[v + T.params.slidesPerGroup] && (w = v, y = T.slidesGrid[v + T.params.slidesPerGroup] - T.slidesGrid[v]) : r >= T.slidesGrid[v] && (w = v, y = T.slidesGrid[T.slidesGrid.length - 1] - T.slidesGrid[T.slidesGrid.length - 2]);
          var x = (r - T.slidesGrid[w]) / y;
          if (s > T.params.longSwipesMs) {
            if (!T.params.longSwipes) return void T.slideTo(T.activeIndex);
            "next" === T.swipeDirection && (x >= T.params.longSwipesRatio ? T.slideTo(w + T.params.slidesPerGroup) : T.slideTo(w)), "prev" === T.swipeDirection && (x > 1 - T.params.longSwipesRatio ? T.slideTo(w + T.params.slidesPerGroup) : T.slideTo(w))
          } else {
            if (!T.params.shortSwipes) return void T.slideTo(T.activeIndex);
            "next" === T.swipeDirection && T.slideTo(w + T.params.slidesPerGroup), "prev" === T.swipeDirection && T.slideTo(w)
          }
        }
      }, T._slideTo = function (e, a) {
        return T.slideTo(e, a, !0, !0)
      }, T.slideTo = function (e, a, t, s) {
        "undefined" == typeof t && (t = !0), "undefined" == typeof e && (e = 0), e < 0 && (e = 0), T.snapIndex = Math.floor(e / T.params.slidesPerGroup), T.snapIndex >= T.snapGrid.length && (T.snapIndex = T.snapGrid.length - 1);
        var r = -T.snapGrid[T.snapIndex];
        if (T.params.autoplay && T.autoplaying && (s || !T.params.autoplayDisableOnInteraction ? T.pauseAutoplay(a) : T.stopAutoplay()), T.updateProgress(r), T.params.normalizeSlideIndex)
          for (var i = 0; i < T.slidesGrid.length; i++) - Math.floor(100 * r) >= Math.floor(100 * T.slidesGrid[i]) && (e = i);
        return !(!T.params.allowSwipeToNext && r < T.translate && r < T.minTranslate()) && (!(!T.params.allowSwipeToPrev && r > T.translate && r > T.maxTranslate() && (T.activeIndex || 0) !== e) && ("undefined" == typeof a && (a = T.params.speed), T.previousIndex = T.activeIndex || 0, T.activeIndex = e, T.updateRealIndex(), T.rtl && -r === T.translate || !T.rtl && r === T.translate ? (T.params.autoHeight && T.updateAutoHeight(), T.updateClasses(), "slide" !== T.params.effect && T.setWrapperTranslate(r), !1) : (T.updateClasses(), T.onTransitionStart(t), 0 === a || T.browser.lteIE9 ? (T.setWrapperTranslate(r), T.setWrapperTransition(0), T.onTransitionEnd(t)) : (T.setWrapperTranslate(r), T.setWrapperTransition(a), T.animating || (T.animating = !0, T.wrapper.transitionEnd(function () {
          T && T.onTransitionEnd(t)
        }))), !0)))
      }, T.onTransitionStart = function (e) {
        "undefined" == typeof e && (e = !0), T.params.autoHeight && T.updateAutoHeight(), T.lazy && T.lazy.onTransitionStart(), e && (T.emit("onTransitionStart", T), T.activeIndex !== T.previousIndex && (T.emit("onSlideChangeStart", T), T.activeIndex > T.previousIndex ? T.emit("onSlideNextStart", T) : T.emit("onSlidePrevStart", T)))
      }, T.onTransitionEnd = function (e) {
        T.animating = !1, T.setWrapperTransition(0), "undefined" == typeof e && (e = !0), T.lazy && T.lazy.onTransitionEnd(), e && (T.emit("onTransitionEnd", T), T.activeIndex !== T.previousIndex && (T.emit("onSlideChangeEnd", T), T.activeIndex > T.previousIndex ? T.emit("onSlideNextEnd", T) : T.emit("onSlidePrevEnd", T))), T.params.history && T.history && T.history.setHistory(T.params.history, T.activeIndex), T.params.hashnav && T.hashnav && T.hashnav.setHash()
      }, T.slideNext = function (e, a, t) {
        if (T.params.loop) {
          if (T.animating) return !1;
          T.fixLoop();
          T.container[0].clientLeft;
          return T.slideTo(T.activeIndex + T.params.slidesPerGroup, a, e, t)
        }
        return T.slideTo(T.activeIndex + T.params.slidesPerGroup, a, e, t)
      }, T._slideNext = function (e) {
        return T.slideNext(!0, e, !0)
      }, T.slidePrev = function (e, a, t) {
        if (T.params.loop) {
          if (T.animating) return !1;
          T.fixLoop();
          T.container[0].clientLeft;
          return T.slideTo(T.activeIndex - 1, a, e, t)
        }
        return T.slideTo(T.activeIndex - 1, a, e, t)
      }, T._slidePrev = function (e) {
        return T.slidePrev(!0, e, !0)
      }, T.slideReset = function (e, a, t) {
        return T.slideTo(T.activeIndex, a, e)
      }, T.disableTouchControl = function () {
        return T.params.onlyExternal = !0, !0
      }, T.enableTouchControl = function () {
        return T.params.onlyExternal = !1, !0
      }, T.setWrapperTransition = function (e, a) {
        T.wrapper.transition(e), "slide" !== T.params.effect && T.effects[T.params.effect] && T.effects[T.params.effect].setTransition(e), T.params.parallax && T.parallax && T.parallax.setTransition(e), T.params.scrollbar && T.scrollbar && T.scrollbar.setTransition(e), T.params.control && T.controller && T.controller.setTransition(e, a), T.emit("onSetTransition", T, e)
      }, T.setWrapperTranslate = function (e, a, t) {
        var s = 0,
          i = 0,
          n = 0;
        T.isHorizontal() ? s = T.rtl ? -e : e : i = e, T.params.roundLengths && (s = r(s), i = r(i)), T.params.virtualTranslate || (T.support.transforms3d ? T.wrapper.transform("translate3d(" + s + "px, " + i + "px, " + n + "px)") : T.wrapper.transform("translate(" + s + "px, " + i + "px)")), T.translate = T.isHorizontal() ? s : i;
        var o, l = T.maxTranslate() - T.minTranslate();
        o = 0 === l ? 0 : (e - T.minTranslate()) / l, o !== T.progress && T.updateProgress(e), a && T.updateActiveIndex(), "slide" !== T.params.effect && T.effects[T.params.effect] && T.effects[T.params.effect].setTranslate(T.translate), T.params.parallax && T.parallax && T.parallax.setTranslate(T.translate), T.params.scrollbar && T.scrollbar && T.scrollbar.setTranslate(T.translate), T.params.control && T.controller && T.controller.setTranslate(T.translate, t), T.emit("onSetTranslate", T, T.translate)
      }, T.getTranslate = function (e, a) {
        var t, s, r, i;
        return "undefined" == typeof a && (a = "x"), T.params.virtualTranslate ? T.rtl ? -T.translate : T.translate : (r = window.getComputedStyle(e, null), window.WebKitCSSMatrix ? (s = r.transform || r.webkitTransform, s.split(",").length > 6 && (s = s.split(", ").map(function (e) {
          return e.replace(",", ".")
        }).join(", ")), i = new window.WebKitCSSMatrix("none" === s ? "" : s)) : (i = r.MozTransform || r.OTransform || r.MsTransform || r.msTransform || r.transform || r.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,"), t = i.toString().split(",")), "x" === a && (s = window.WebKitCSSMatrix ? i.m41 : 16 === t.length ? parseFloat(t[12]) : parseFloat(t[4])), "y" === a && (s = window.WebKitCSSMatrix ? i.m42 : 16 === t.length ? parseFloat(t[13]) : parseFloat(t[5])), T.rtl && s && (s = -s), s || 0)
      }, T.getWrapperTranslate = function (e) {
        return "undefined" == typeof e && (e = T.isHorizontal() ? "x" : "y"), T.getTranslate(T.wrapper[0], e)
      }, T.observers = [], T.initObservers = function () {
        if (T.params.observeParents)
          for (var e = T.container.parents(), a = 0; a < e.length; a++) o(e[a]);
        o(T.container[0], {
          childList: !1
        }), o(T.wrapper[0], {
          attributes: !1
        })
      }, T.disconnectObservers = function () {
        for (var e = 0; e < T.observers.length; e++) T.observers[e].disconnect();
        T.observers = []
      }, T.createLoop = function () {
        T.wrapper.children("." + T.params.slideClass + "." + T.params.slideDuplicateClass).remove();
        var e = T.wrapper.children("." + T.params.slideClass);
        "auto" !== T.params.slidesPerView || T.params.loopedSlides || (T.params.loopedSlides = e.length), T.loopedSlides = parseInt(T.params.loopedSlides || T.params.slidesPerView, 10), T.loopedSlides = T.loopedSlides + T.params.loopAdditionalSlides, T.loopedSlides > e.length && (T.loopedSlides = e.length);
        var t, s = [],
          r = [];
        for (e.each(function (t, i) {
            var n = a(this);
            t < T.loopedSlides && r.push(i), t < e.length && t >= e.length - T.loopedSlides && s.push(i), n.attr("data-swiper-slide-index", t)
          }), t = 0; t < r.length; t++) T.wrapper.append(a(r[t].cloneNode(!0)).addClass(T.params.slideDuplicateClass));
        for (t = s.length - 1; t >= 0; t--) T.wrapper.prepend(a(s[t].cloneNode(!0)).addClass(T.params.slideDuplicateClass))
      }, T.destroyLoop = function () {
        T.wrapper.children("." + T.params.slideClass + "." + T.params.slideDuplicateClass).remove(), T.slides.removeAttr("data-swiper-slide-index")
      }, T.reLoop = function (e) {
        var a = T.activeIndex - T.loopedSlides;
        T.destroyLoop(), T.createLoop(), T.updateSlidesSize(), e && T.slideTo(a + T.loopedSlides, 0, !1)
      }, T.fixLoop = function () {
        var e;
        T.activeIndex < T.loopedSlides ? (e = T.slides.length - 3 * T.loopedSlides + T.activeIndex, e += T.loopedSlides, T.slideTo(e, 0, !1, !0)) : ("auto" === T.params.slidesPerView && T.activeIndex >= 2 * T.loopedSlides || T.activeIndex > T.slides.length - 2 * T.params.slidesPerView) && (e = -T.slides.length + T.activeIndex + T.loopedSlides, e += T.loopedSlides, T.slideTo(e, 0, !1, !0))
      }, T.appendSlide = function (e) {
        if (T.params.loop && T.destroyLoop(), "object" == typeof e && e.length)
          for (var a = 0; a < e.length; a++) e[a] && T.wrapper.append(e[a]);
        else T.wrapper.append(e);
        T.params.loop && T.createLoop(), T.params.observer && T.support.observer || T.update(!0)
      }, T.prependSlide = function (e) {
        T.params.loop && T.destroyLoop();
        var a = T.activeIndex + 1;
        if ("object" == typeof e && e.length) {
          for (var t = 0; t < e.length; t++) e[t] && T.wrapper.prepend(e[t]);
          a = T.activeIndex + e.length
        } else T.wrapper.prepend(e);
        T.params.loop && T.createLoop(), T.params.observer && T.support.observer || T.update(!0), T.slideTo(a, 0, !1)
      }, T.removeSlide = function (e) {
        T.params.loop && (T.destroyLoop(), T.slides = T.wrapper.children("." + T.params.slideClass));
        var a, t = T.activeIndex;
        if ("object" == typeof e && e.length) {
          for (var s = 0; s < e.length; s++) a = e[s], T.slides[a] && T.slides.eq(a).remove(), a < t && t--;
          t = Math.max(t, 0)
        } else a = e, T.slides[a] && T.slides.eq(a).remove(), a < t && t--, t = Math.max(t, 0);
        T.params.loop && T.createLoop(), T.params.observer && T.support.observer || T.update(!0), T.params.loop ? T.slideTo(t + T.loopedSlides, 0, !1) : T.slideTo(t, 0, !1)
      }, T.removeAllSlides = function () {
        for (var e = [], a = 0; a < T.slides.length; a++) e.push(a);
        T.removeSlide(e)
      }, T.effects = {
        fade: {
          setTranslate: function () {
            for (var e = 0; e < T.slides.length; e++) {
              var a = T.slides.eq(e),
                t = a[0].swiperSlideOffset,
                s = -t;
              T.params.virtualTranslate || (s -= T.translate);
              var r = 0;
              T.isHorizontal() || (r = s, s = 0);
              var i = T.params.fade.crossFade ? Math.max(1 - Math.abs(a[0].progress), 0) : 1 + Math.min(Math.max(a[0].progress, -1), 0);
              a.css({
                opacity: i
              }).transform("translate3d(" + s + "px, " + r + "px, 0px)")
            }
          },
          setTransition: function (e) {
            if (T.slides.transition(e), T.params.virtualTranslate && 0 !== e) {
              var a = !1;
              T.slides.transitionEnd(function () {
                if (!a && T) {
                  a = !0, T.animating = !1;
                  for (var e = ["webkitTransitionEnd", "transitionend", "oTransitionEnd", "MSTransitionEnd", "msTransitionEnd"], t = 0; t < e.length; t++) T.wrapper.trigger(e[t])
                }
              })
            }
          }
        },
        flip: {
          setTranslate: function () {
            for (var e = 0; e < T.slides.length; e++) {
              var t = T.slides.eq(e),
                s = t[0].progress;
              T.params.flip.limitRotation && (s = Math.max(Math.min(t[0].progress, 1), -1));
              var r = t[0].swiperSlideOffset,
                i = -180 * s,
                n = i,
                o = 0,
                l = -r,
                p = 0;
              if (T.isHorizontal() ? T.rtl && (n = -n) : (p = l, l = 0, o = -n, n = 0), t[0].style.zIndex = -Math.abs(Math.round(s)) + T.slides.length, T.params.flip.slideShadows) {
                var d = T.isHorizontal() ? t.find(".swiper-slide-shadow-left") : t.find(".swiper-slide-shadow-top"),
                  u = T.isHorizontal() ? t.find(".swiper-slide-shadow-right") : t.find(".swiper-slide-shadow-bottom");
                0 === d.length && (d = a('<div class="{$maccms.cache_flag} swiper-slide-shadow-' + (T.isHorizontal() ? "left" : "top") + '"></div>'), t.append(d)), 0 === u.length && (u = a('<div class="{$maccms.cache_flag} swiper-slide-shadow-' + (T.isHorizontal() ? "right" : "bottom") + '"></div>'), t.append(u)), d.length && (d[0].style.opacity = Math.max(-s, 0)), u.length && (u[0].style.opacity = Math.max(s, 0))
              }
              t.transform("translate3d(" + l + "px, " + p + "px, 0px) rotateX(" + o + "deg) rotateY(" + n + "deg)")
            }
          },
          setTransition: function (e) {
            if (T.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e), T.params.virtualTranslate && 0 !== e) {
              var t = !1;
              T.slides.eq(T.activeIndex).transitionEnd(function () {
                if (!t && T && a(this).hasClass(T.params.slideActiveClass)) {
                  t = !0, T.animating = !1;
                  for (var e = ["webkitTransitionEnd", "transitionend", "oTransitionEnd", "MSTransitionEnd", "msTransitionEnd"], s = 0; s < e.length; s++) T.wrapper.trigger(e[s])
                }
              })
            }
          }
        },
        cube: {
          setTranslate: function () {
            var e, t = 0;
            T.params.cube.shadow && (T.isHorizontal() ? (e = T.wrapper.find(".swiper-cube-shadow"), 0 === e.length && (e = a('<div class="{$maccms.cache_flag} swiper-cube-shadow"></div>'), T.wrapper.append(e)), e.css({
              height: T.width + "px"
            })) : (e = T.container.find(".swiper-cube-shadow"), 0 === e.length && (e = a('<div class="{$maccms.cache_flag} swiper-cube-shadow"></div>'), T.container.append(e))));
            for (var s = 0; s < T.slides.length; s++) {
              var r = T.slides.eq(s),
                i = 90 * s,
                n = Math.floor(i / 360);
              T.rtl && (i = -i, n = Math.floor(-i / 360));
              var o = Math.max(Math.min(r[0].progress, 1), -1),
                l = 0,
                p = 0,
                d = 0;
              s % 4 === 0 ? (l = 4 * -n * T.size, d = 0) : (s - 1) % 4 === 0 ? (l = 0, d = 4 * -n * T.size) : (s - 2) % 4 === 0 ? (l = T.size + 4 * n * T.size, d = T.size) : (s - 3) % 4 === 0 && (l = -T.size, d = 3 * T.size + 4 * T.size * n), T.rtl && (l = -l), T.isHorizontal() || (p = l, l = 0);
              var u = "rotateX(" + (T.isHorizontal() ? 0 : -i) + "deg) rotateY(" + (T.isHorizontal() ? i : 0) + "deg) translate3d(" + l + "px, " + p + "px, " + d + "px)";
              if (o <= 1 && o > -1 && (t = 90 * s + 90 * o, T.rtl && (t = 90 * -s - 90 * o)), r.transform(u), T.params.cube.slideShadows) {
                var m = T.isHorizontal() ? r.find(".swiper-slide-shadow-left") : r.find(".swiper-slide-shadow-top"),
                  c = T.isHorizontal() ? r.find(".swiper-slide-shadow-right") : r.find(".swiper-slide-shadow-bottom");
                0 === m.length && (m = a('<div class="{$maccms.cache_flag} swiper-slide-shadow-' + (T.isHorizontal() ? "left" : "top") + '"></div>'), r.append(m)), 0 === c.length && (c = a('<div class="{$maccms.cache_flag} swiper-slide-shadow-' + (T.isHorizontal() ? "right" : "bottom") + '"></div>'), r.append(c)), m.length && (m[0].style.opacity = Math.max(-o, 0)), c.length && (c[0].style.opacity = Math.max(o, 0))
              }
            }
            if (T.wrapper.css({
                "-webkit-transform-origin": "50% 50% -" + T.size / 2 + "px",
                "-moz-transform-origin": "50% 50% -" + T.size / 2 + "px",
                "-ms-transform-origin": "50% 50% -" + T.size / 2 + "px",
                "transform-origin": "50% 50% -" + T.size / 2 + "px"
              }), T.params.cube.shadow)
              if (T.isHorizontal()) e.transform("translate3d(0px, " + (T.width / 2 + T.params.cube.shadowOffset) + "px, " + -T.width / 2 + "px) rotateX(90deg) rotateZ(0deg) scale(" + T.params.cube.shadowScale + ")");
              else {
                var g = Math.abs(t) - 90 * Math.floor(Math.abs(t) / 90),
                  h = 1.5 - (Math.sin(2 * g * Math.PI / 360) / 2 + Math.cos(2 * g * Math.PI / 360) / 2),
                  f = T.params.cube.shadowScale,
                  v = T.params.cube.shadowScale / h,
                  w = T.params.cube.shadowOffset;
                e.transform("scale3d(" + f + ", 1, " + v + ") translate3d(0px, " + (T.height / 2 + w) + "px, " + -T.height / 2 / v + "px) rotateX(-90deg)")
              }
            var y = T.isSafari || T.isUiWebView ? -T.size / 2 : 0;
            T.wrapper.transform("translate3d(0px,0," + y + "px) rotateX(" + (T.isHorizontal() ? 0 : t) + "deg) rotateY(" + (T.isHorizontal() ? -t : 0) + "deg)")
          },
          setTransition: function (e) {
            T.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e), T.params.cube.shadow && !T.isHorizontal() && T.container.find(".swiper-cube-shadow").transition(e)
          }
        },
        coverflow: {
          setTranslate: function () {
            for (var e = T.translate, t = T.isHorizontal() ? -e + T.width / 2 : -e + T.height / 2, s = T.isHorizontal() ? T.params.coverflow.rotate : -T.params.coverflow.rotate, r = T.params.coverflow.depth, i = 0, n = T.slides.length; i < n; i++) {
              var o = T.slides.eq(i),
                l = T.slidesSizesGrid[i],
                p = o[0].swiperSlideOffset,
                d = (t - p - l / 2) / l * T.params.coverflow.modifier,
                u = T.isHorizontal() ? s * d : 0,
                m = T.isHorizontal() ? 0 : s * d,
                c = -r * Math.abs(d),
                g = T.isHorizontal() ? 0 : T.params.coverflow.stretch * d,
                h = T.isHorizontal() ? T.params.coverflow.stretch * d : 0;
              Math.abs(h) < .001 && (h = 0), Math.abs(g) < .001 && (g = 0), Math.abs(c) < .001 && (c = 0), Math.abs(u) < .001 && (u = 0), Math.abs(m) < .001 && (m = 0);
              var f = "translate3d(" + h + "px," + g + "px," + c + "px)  rotateX(" + m + "deg) rotateY(" + u + "deg)";
              if (o.transform(f), o[0].style.zIndex = -Math.abs(Math.round(d)) + 1, T.params.coverflow.slideShadows) {
                var v = T.isHorizontal() ? o.find(".swiper-slide-shadow-left") : o.find(".swiper-slide-shadow-top"),
                  w = T.isHorizontal() ? o.find(".swiper-slide-shadow-right") : o.find(".swiper-slide-shadow-bottom");
                0 === v.length && (v = a('<div class="{$maccms.cache_flag} swiper-slide-shadow-' + (T.isHorizontal() ? "left" : "top") + '"></div>'), o.append(v)), 0 === w.length && (w = a('<div class="{$maccms.cache_flag} swiper-slide-shadow-' + (T.isHorizontal() ? "right" : "bottom") + '"></div>'), o.append(w)), v.length && (v[0].style.opacity = d > 0 ? d : 0), w.length && (w[0].style.opacity = -d > 0 ? -d : 0)
              }
            }
            if (T.browser.ie) {
              var y = T.wrapper[0].style;
              y.perspectiveOrigin = t + "px 50%"
            }
          },
          setTransition: function (e) {
            T.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e)
          }
        }
      }, T.lazy = {
        initialImageLoaded: !1,
        loadImageInSlide: function (e, t) {
          if ("undefined" != typeof e && ("undefined" == typeof t && (t = !0), 0 !== T.slides.length)) {
            var s = T.slides.eq(e),
              r = s.find("." + T.params.lazyLoadingClass + ":not(." + T.params.lazyStatusLoadedClass + "):not(." + T.params.lazyStatusLoadingClass + ")");
            !s.hasClass(T.params.lazyLoadingClass) || s.hasClass(T.params.lazyStatusLoadedClass) || s.hasClass(T.params.lazyStatusLoadingClass) || (r = r.add(s[0])), 0 !== r.length && r.each(function () {
              var e = a(this);
              e.addClass(T.params.lazyStatusLoadingClass);
              var r = e.attr("data-background"),
                i = e.attr("data-src"),
                n = e.attr("data-srcset"),
                o = e.attr("data-sizes");
              T.loadImage(e[0], i || r, n, o, !1, function () {
                if (r ? (e.css("background-image", 'url("' + r + '")'), e.removeAttr("data-background")) : (n && (e.attr("srcset", n), e.removeAttr("data-srcset")), o && (e.attr("sizes", o), e.removeAttr("data-sizes")), i && (e.attr("src", i), e.removeAttr("data-src"))), e.addClass(T.params.lazyStatusLoadedClass).removeClass(T.params.lazyStatusLoadingClass), s.find("." + T.params.lazyPreloaderClass + ", ." + T.params.preloaderClass).remove(), T.params.loop && t) {
                  var a = s.attr("data-swiper-slide-index");
                  if (s.hasClass(T.params.slideDuplicateClass)) {
                    var l = T.wrapper.children('[data-swiper-slide-index="' + a + '"]:not(.' + T.params.slideDuplicateClass + ")");
                    T.lazy.loadImageInSlide(l.index(), !1)
                  } else {
                    var p = T.wrapper.children("." + T.params.slideDuplicateClass + '[data-swiper-slide-index="' + a + '"]');
                    T.lazy.loadImageInSlide(p.index(), !1)
                  }
                }
                T.emit("onLazyImageReady", T, s[0], e[0])
              }), T.emit("onLazyImageLoad", T, s[0], e[0])
            })
          }
        },
        load: function () {
          var e, t = T.params.slidesPerView;
          if ("auto" === t && (t = 0), T.lazy.initialImageLoaded || (T.lazy.initialImageLoaded = !0), T.params.watchSlidesVisibility) T.wrapper.children("." + T.params.slideVisibleClass).each(function () {
            T.lazy.loadImageInSlide(a(this).index())
          });
          else if (t > 1)
            for (e = T.activeIndex; e < T.activeIndex + t; e++) T.slides[e] && T.lazy.loadImageInSlide(e);
          else T.lazy.loadImageInSlide(T.activeIndex);
          if (T.params.lazyLoadingInPrevNext)
            if (t > 1 || T.params.lazyLoadingInPrevNextAmount && T.params.lazyLoadingInPrevNextAmount > 1) {
              var s = T.params.lazyLoadingInPrevNextAmount,
                r = t,
                i = Math.min(T.activeIndex + r + Math.max(s, r), T.slides.length),
                n = Math.max(T.activeIndex - Math.max(r, s), 0);
              for (e = T.activeIndex + t; e < i; e++) T.slides[e] && T.lazy.loadImageInSlide(e);
              for (e = n; e < T.activeIndex; e++) T.slides[e] && T.lazy.loadImageInSlide(e)
            } else {
              var o = T.wrapper.children("." + T.params.slideNextClass);
              o.length > 0 && T.lazy.loadImageInSlide(o.index());
              var l = T.wrapper.children("." + T.params.slidePrevClass);
              l.length > 0 && T.lazy.loadImageInSlide(l.index())
            }
        },
        onTransitionStart: function () {
          T.params.lazyLoading && (T.params.lazyLoadingOnTransitionStart || !T.params.lazyLoadingOnTransitionStart && !T.lazy.initialImageLoaded) && T.lazy.load()
        },
        onTransitionEnd: function () {
          T.params.lazyLoading && !T.params.lazyLoadingOnTransitionStart && T.lazy.load()
        }
      }, T.scrollbar = {
        isTouched: !1,
        setDragPosition: function (e) {
          var a = T.scrollbar,
            t = T.isHorizontal() ? "touchstart" === e.type || "touchmove" === e.type ? e.targetTouches[0].pageX : e.pageX || e.clientX : "touchstart" === e.type || "touchmove" === e.type ? e.targetTouches[0].pageY : e.pageY || e.clientY,
            s = t - a.track.offset()[T.isHorizontal() ? "left" : "top"] - a.dragSize / 2,
            r = -T.minTranslate() * a.moveDivider,
            i = -T.maxTranslate() * a.moveDivider;
          s < r ? s = r : s > i && (s = i), s = -s / a.moveDivider, T.updateProgress(s), T.setWrapperTranslate(s, !0)
        },
        dragStart: function (e) {
          var a = T.scrollbar;
          a.isTouched = !0, e.preventDefault(), e.stopPropagation(), a.setDragPosition(e), clearTimeout(a.dragTimeout), a.track.transition(0), T.params.scrollbarHide && a.track.css("opacity", 1), T.wrapper.transition(100), a.drag.transition(100), T.emit("onScrollbarDragStart", T)
        },
        dragMove: function (e) {
          var a = T.scrollbar;
          a.isTouched && (e.preventDefault ? e.preventDefault() : e.returnValue = !1, a.setDragPosition(e), T.wrapper.transition(0), a.track.transition(0), a.drag.transition(0), T.emit("onScrollbarDragMove", T))
        },
        dragEnd: function (e) {
          var a = T.scrollbar;
          a.isTouched && (a.isTouched = !1, T.params.scrollbarHide && (clearTimeout(a.dragTimeout), a.dragTimeout = setTimeout(function () {
            a.track.css("opacity", 0), a.track.transition(400)
          }, 1e3)), T.emit("onScrollbarDragEnd", T), T.params.scrollbarSnapOnRelease && T.slideReset())
        },
        draggableEvents: function () {
          return T.params.simulateTouch !== !1 || T.support.touch ? T.touchEvents : T.touchEventsDesktop
        }(),
        enableDraggable: function () {
          var e = T.scrollbar,
            t = T.support.touch ? e.track : document;
          a(e.track).on(e.draggableEvents.start, e.dragStart), a(t).on(e.draggableEvents.move, e.dragMove), a(t).on(e.draggableEvents.end, e.dragEnd)
        },
        disableDraggable: function () {
          var e = T.scrollbar,
            t = T.support.touch ? e.track : document;
          a(e.track).off(e.draggableEvents.start, e.dragStart), a(t).off(e.draggableEvents.move, e.dragMove), a(t).off(e.draggableEvents.end, e.dragEnd)
        },
        set: function () {
          if (T.params.scrollbar) {
            var e = T.scrollbar;
            e.track = a(T.params.scrollbar), T.params.uniqueNavElements && "string" == typeof T.params.scrollbar && e.track.length > 1 && 1 === T.container.find(T.params.scrollbar).length && (e.track = T.container.find(T.params.scrollbar)), e.drag = e.track.find(".swiper-scrollbar-drag"), 0 === e.drag.length && (e.drag = a('<div class="{$maccms.cache_flag} swiper-scrollbar-drag"></div>'), e.track.append(e.drag)), e.drag[0].style.width = "", e.drag[0].style.height = "", e.trackSize = T.isHorizontal() ? e.track[0].offsetWidth : e.track[0].offsetHeight, e.divider = T.size / T.virtualSize, e.moveDivider = e.divider * (e.trackSize / T.size), e.dragSize = e.trackSize * e.divider, T.isHorizontal() ? e.drag[0].style.width = e.dragSize + "px" : e.drag[0].style.height = e.dragSize + "px", e.divider >= 1 ? e.track[0].style.display = "none" : e.track[0].style.display = "", T.params.scrollbarHide && (e.track[0].style.opacity = 0)
          }
        },
        setTranslate: function () {
          if (T.params.scrollbar) {
            var e, a = T.scrollbar,
              t = (T.translate || 0, a.dragSize);
            e = (a.trackSize - a.dragSize) * T.progress, T.rtl && T.isHorizontal() ? (e = -e, e > 0 ? (t = a.dragSize - e, e = 0) : -e + a.dragSize > a.trackSize && (t = a.trackSize + e)) : e < 0 ? (t = a.dragSize + e, e = 0) : e + a.dragSize > a.trackSize && (t = a.trackSize - e), T.isHorizontal() ? (T.support.transforms3d ? a.drag.transform("translate3d(" + e + "px, 0, 0)") : a.drag.transform("translateX(" + e + "px)"), a.drag[0].style.width = t + "px") : (T.support.transforms3d ? a.drag.transform("translate3d(0px, " + e + "px, 0)") : a.drag.transform("translateY(" + e + "px)"), a.drag[0].style.height = t + "px"), T.params.scrollbarHide && (clearTimeout(a.timeout), a.track[0].style.opacity = 1, a.timeout = setTimeout(function () {
              a.track[0].style.opacity = 0, a.track.transition(400)
            }, 1e3))
          }
        },
        setTransition: function (e) {
          T.params.scrollbar && T.scrollbar.drag.transition(e)
        }
      }, T.controller = {
        LinearSpline: function (e, a) {
          this.x = e, this.y = a, this.lastIndex = e.length - 1;
          var t, s;
          this.x.length;
          this.interpolate = function (e) {
            return e ? (s = r(this.x, e), t = s - 1, (e - this.x[t]) * (this.y[s] - this.y[t]) / (this.x[s] - this.x[t]) + this.y[t]) : 0
          };
          var r = function () {
            var e, a, t;
            return function (s, r) {
              for (a = -1, e = s.length; e - a > 1;) s[t = e + a >> 1] <= r ? a = t : e = t;
              return e
            }
          }()
        },
        getInterpolateFunction: function (e) {
          T.controller.spline || (T.controller.spline = T.params.loop ? new T.controller.LinearSpline(T.slidesGrid, e.slidesGrid) : new T.controller.LinearSpline(T.snapGrid, e.snapGrid))
        },
        setTranslate: function (e, a) {
          function s(a) {
            e = a.rtl && "horizontal" === a.params.direction ? -T.translate : T.translate, "slide" === T.params.controlBy && (T.controller.getInterpolateFunction(a), i = -T.controller.spline.interpolate(-e)), i && "container" !== T.params.controlBy || (r = (a.maxTranslate() - a.minTranslate()) / (T.maxTranslate() - T.minTranslate()), i = (e - T.minTranslate()) * r + a.minTranslate()), T.params.controlInverse && (i = a.maxTranslate() - i), a.updateProgress(i), a.setWrapperTranslate(i, !1, T), a.updateActiveIndex()
          }
          var r, i, n = T.params.control;
          if (T.isArray(n))
            for (var o = 0; o < n.length; o++) n[o] !== a && n[o] instanceof t && s(n[o]);
          else n instanceof t && a !== n && s(n)
        },
        setTransition: function (e, a) {
          function s(a) {
            a.setWrapperTransition(e, T), 0 !== e && (a.onTransitionStart(), a.wrapper.transitionEnd(function () {
              i && (a.params.loop && "slide" === T.params.controlBy && a.fixLoop(), a.onTransitionEnd())
            }))
          }
          var r, i = T.params.control;
          if (T.isArray(i))
            for (r = 0; r < i.length; r++) i[r] !== a && i[r] instanceof t && s(i[r]);
          else i instanceof t && a !== i && s(i)
        }
      }, T.hashnav = {
        onHashCange: function (e, a) {
          var t = document.location.hash.replace("#", ""),
            s = T.slides.eq(T.activeIndex).attr("data-hash");
          t !== s && T.slideTo(T.wrapper.children("." + T.params.slideClass + '[data-hash="' + t + '"]').index())
        },
        attachEvents: function (e) {
          var t = e ? "off" : "on";
          a(window)[t]("hashchange", T.hashnav.onHashCange)
        },
        setHash: function () {
          if (T.hashnav.initialized && T.params.hashnav)
            if (T.params.replaceState && window.history && window.history.replaceState) window.history.replaceState(null, null, "#" + T.slides.eq(T.activeIndex).attr("data-hash") || "");
            else {
              var e = T.slides.eq(T.activeIndex),
                a = e.attr("data-hash") || e.attr("data-history");
              document.location.hash = a || ""
            }
        },
        init: function () {
          if (T.params.hashnav && !T.params.history) {
            T.hashnav.initialized = !0;
            var e = document.location.hash.replace("#", "");
            if (e)
              for (var a = 0, t = 0, s = T.slides.length; t < s; t++) {
                var r = T.slides.eq(t),
                  i = r.attr("data-hash") || r.attr("data-history");
                if (i === e && !r.hasClass(T.params.slideDuplicateClass)) {
                  var n = r.index();
                  T.slideTo(n, a, T.params.runCallbacksOnInit, !0)
                }
              }
            T.params.hashnavWatchState && T.hashnav.attachEvents()
          }
        },
        destroy: function () {
          T.params.hashnavWatchState && T.hashnav.attachEvents(!0)
        }
      }, T.history = {
        init: function () {
          if (T.params.history) {
            if (!window.history || !window.history.pushState) return T.params.history = !1, void(T.params.hashnav = !0);
            T.history.initialized = !0, this.paths = this.getPathValues(), (this.paths.key || this.paths.value) && (this.scrollToSlide(0, this.paths.value, T.params.runCallbacksOnInit), T.params.replaceState || window.addEventListener("popstate", this.setHistoryPopState))
          }
        },
        setHistoryPopState: function () {
          T.history.paths = T.history.getPathValues(), T.history.scrollToSlide(T.params.speed, T.history.paths.value, !1)
        },
        getPathValues: function () {
          var e = window.location.pathname.slice(1).split("/"),
            a = e.length,
            t = e[a - 2],
            s = e[a - 1];
          return {
            key: t,
            value: s
          }
        },
        setHistory: function (e, a) {
          if (T.history.initialized && T.params.history) {
            var t = T.slides.eq(a),
              s = this.slugify(t.attr("data-history"));
            window.location.pathname.includes(e) || (s = e + "/" + s), T.params.replaceState ? window.history.replaceState(null, null, s) : window.history.pushState(null, null, s)
          }
        },
        slugify: function (e) {
          return e.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "")
        },
        scrollToSlide: function (e, a, t) {
          if (a)
            for (var s = 0, r = T.slides.length; s < r; s++) {
              var i = T.slides.eq(s),
                n = this.slugify(i.attr("data-history"));
              if (n === a && !i.hasClass(T.params.slideDuplicateClass)) {
                var o = i.index();
                T.slideTo(o, e, t)
              }
            } else T.slideTo(0, e, t)
        }
      }, T.disableKeyboardControl = function () {
        T.params.keyboardControl = !1, a(document).off("keydown", l)
      }, T.enableKeyboardControl = function () {
        T.params.keyboardControl = !0, a(document).on("keydown", l)
      }, T.mousewheel = {
        event: !1,
        lastScrollTime: (new window.Date).getTime()
      }, T.params.mousewheelControl && (T.mousewheel.event = navigator.userAgent.indexOf("firefox") > -1 ? "DOMMouseScroll" : p() ? "wheel" : "mousewheel"), T.disableMousewheelControl = function () {
        if (!T.mousewheel.event) return !1;
        var e = T.container;
        return "container" !== T.params.mousewheelEventsTarged && (e = a(T.params.mousewheelEventsTarged)), e.off(T.mousewheel.event, d), !0
      }, T.enableMousewheelControl = function () {
        if (!T.mousewheel.event) return !1;
        var e = T.container;
        return "container" !== T.params.mousewheelEventsTarged && (e = a(T.params.mousewheelEventsTarged)), e.on(T.mousewheel.event, d), !0
      }, T.parallax = {
        setTranslate: function () {
          T.container.children("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function () {
            m(this, T.progress)
          }), T.slides.each(function () {
            var e = a(this);
            e.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function () {
              var a = Math.min(Math.max(e[0].progress, -1), 1);
              m(this, a)
            })
          })
        },
        setTransition: function (e) {
          "undefined" == typeof e && (e = T.params.speed), T.container.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function () {
            var t = a(this),
              s = parseInt(t.attr("data-swiper-parallax-duration"), 10) || e;
            0 === e && (s = 0), t.transition(s)
          })
        }
      }, T.zoom = {
        scale: 1,
        currentScale: 1,
        isScaling: !1,
        gesture: {
          slide: void 0,
          slideWidth: void 0,
          slideHeight: void 0,
          image: void 0,
          imageWrap: void 0,
          zoomMax: T.params.zoomMax
        },
        image: {
          isTouched: void 0,
          isMoved: void 0,
          currentX: void 0,
          currentY: void 0,
          minX: void 0,
          minY: void 0,
          maxX: void 0,
          maxY: void 0,
          width: void 0,
          height: void 0,
          startX: void 0,
          startY: void 0,
          touchesStart: {},
          touchesCurrent: {}
        },
        velocity: {
          x: void 0,
          y: void 0,
          prevPositionX: void 0,
          prevPositionY: void 0,
          prevTime: void 0
        },
        getDistanceBetweenTouches: function (e) {
          if (e.targetTouches.length < 2) return 1;
          var a = e.targetTouches[0].pageX,
            t = e.targetTouches[0].pageY,
            s = e.targetTouches[1].pageX,
            r = e.targetTouches[1].pageY,
            i = Math.sqrt(Math.pow(s - a, 2) + Math.pow(r - t, 2));
          return i
        },
        onGestureStart: function (e) {
          var t = T.zoom;
          if (!T.support.gestures) {
            if ("touchstart" !== e.type || "touchstart" === e.type && e.targetTouches.length < 2) return;
            t.gesture.scaleStart = t.getDistanceBetweenTouches(e)
          }
          return t.gesture.slide && t.gesture.slide.length || (t.gesture.slide = a(this), 0 === t.gesture.slide.length && (t.gesture.slide = T.slides.eq(T.activeIndex)), t.gesture.image = t.gesture.slide.find("img, svg, canvas"), t.gesture.imageWrap = t.gesture.image.parent("." + T.params.zoomContainerClass), t.gesture.zoomMax = t.gesture.imageWrap.attr("data-swiper-zoom") || T.params.zoomMax, 0 !== t.gesture.imageWrap.length) ? (t.gesture.image.transition(0), void(t.isScaling = !0)) : void(t.gesture.image = void 0)
        },
        onGestureChange: function (e) {
          var a = T.zoom;
          if (!T.support.gestures) {
            if ("touchmove" !== e.type || "touchmove" === e.type && e.targetTouches.length < 2) return;
            a.gesture.scaleMove = a.getDistanceBetweenTouches(e)
          }
          a.gesture.image && 0 !== a.gesture.image.length && (T.support.gestures ? a.scale = e.scale * a.currentScale : a.scale = a.gesture.scaleMove / a.gesture.scaleStart * a.currentScale, a.scale > a.gesture.zoomMax && (a.scale = a.gesture.zoomMax - 1 + Math.pow(a.scale - a.gesture.zoomMax + 1, .5)), a.scale < T.params.zoomMin && (a.scale = T.params.zoomMin + 1 - Math.pow(T.params.zoomMin - a.scale + 1, .5)), a.gesture.image.transform("translate3d(0,0,0) scale(" + a.scale + ")"))
        },
        onGestureEnd: function (e) {
          var a = T.zoom;
          !T.support.gestures && ("touchend" !== e.type || "touchend" === e.type && e.changedTouches.length < 2) || a.gesture.image && 0 !== a.gesture.image.length && (a.scale = Math.max(Math.min(a.scale, a.gesture.zoomMax), T.params.zoomMin), a.gesture.image.transition(T.params.speed).transform("translate3d(0,0,0) scale(" + a.scale + ")"), a.currentScale = a.scale, a.isScaling = !1, 1 === a.scale && (a.gesture.slide = void 0))
        },
        onTouchStart: function (e, a) {
          var t = e.zoom;
          t.gesture.image && 0 !== t.gesture.image.length && (t.image.isTouched || ("android" === e.device.os && a.preventDefault(), t.image.isTouched = !0, t.image.touchesStart.x = "touchstart" === a.type ? a.targetTouches[0].pageX : a.pageX, t.image.touchesStart.y = "touchstart" === a.type ? a.targetTouches[0].pageY : a.pageY))
        },
        onTouchMove: function (e) {
          var a = T.zoom;
          if (a.gesture.image && 0 !== a.gesture.image.length && (T.allowClick = !1, a.image.isTouched && a.gesture.slide)) {
            a.image.isMoved || (a.image.width = a.gesture.image[0].offsetWidth, a.image.height = a.gesture.image[0].offsetHeight, a.image.startX = T.getTranslate(a.gesture.imageWrap[0], "x") || 0, a.image.startY = T.getTranslate(a.gesture.imageWrap[0], "y") || 0, a.gesture.slideWidth = a.gesture.slide[0].offsetWidth, a.gesture.slideHeight = a.gesture.slide[0].offsetHeight, a.gesture.imageWrap.transition(0), T.rtl && (a.image.startX = -a.image.startX), T.rtl && (a.image.startY = -a.image.startY));
            var t = a.image.width * a.scale,
              s = a.image.height * a.scale;
            if (!(t < a.gesture.slideWidth && s < a.gesture.slideHeight)) {
              if (a.image.minX = Math.min(a.gesture.slideWidth / 2 - t / 2, 0), a.image.maxX = -a.image.minX, a.image.minY = Math.min(a.gesture.slideHeight / 2 - s / 2, 0), a.image.maxY = -a.image.minY, a.image.touchesCurrent.x = "touchmove" === e.type ? e.targetTouches[0].pageX : e.pageX, a.image.touchesCurrent.y = "touchmove" === e.type ? e.targetTouches[0].pageY : e.pageY, !a.image.isMoved && !a.isScaling) {
                if (T.isHorizontal() && Math.floor(a.image.minX) === Math.floor(a.image.startX) && a.image.touchesCurrent.x < a.image.touchesStart.x || Math.floor(a.image.maxX) === Math.floor(a.image.startX) && a.image.touchesCurrent.x > a.image.touchesStart.x) return void(a.image.isTouched = !1);
                if (!T.isHorizontal() && Math.floor(a.image.minY) === Math.floor(a.image.startY) && a.image.touchesCurrent.y < a.image.touchesStart.y || Math.floor(a.image.maxY) === Math.floor(a.image.startY) && a.image.touchesCurrent.y > a.image.touchesStart.y) return void(a.image.isTouched = !1)
              }
              e.preventDefault(), e.stopPropagation(), a.image.isMoved = !0, a.image.currentX = a.image.touchesCurrent.x - a.image.touchesStart.x + a.image.startX, a.image.currentY = a.image.touchesCurrent.y - a.image.touchesStart.y + a.image.startY, a.image.currentX < a.image.minX && (a.image.currentX = a.image.minX + 1 - Math.pow(a.image.minX - a.image.currentX + 1, .8)), a.image.currentX > a.image.maxX && (a.image.currentX = a.image.maxX - 1 + Math.pow(a.image.currentX - a.image.maxX + 1, .8)), a.image.currentY < a.image.minY && (a.image.currentY = a.image.minY + 1 - Math.pow(a.image.minY - a.image.currentY + 1, .8)), a.image.currentY > a.image.maxY && (a.image.currentY = a.image.maxY - 1 + Math.pow(a.image.currentY - a.image.maxY + 1, .8)), a.velocity.prevPositionX || (a.velocity.prevPositionX = a.image.touchesCurrent.x), a.velocity.prevPositionY || (a.velocity.prevPositionY = a.image.touchesCurrent.y), a.velocity.prevTime || (a.velocity.prevTime = Date.now()), a.velocity.x = (a.image.touchesCurrent.x - a.velocity.prevPositionX) / (Date.now() - a.velocity.prevTime) / 2, a.velocity.y = (a.image.touchesCurrent.y - a.velocity.prevPositionY) / (Date.now() - a.velocity.prevTime) / 2, Math.abs(a.image.touchesCurrent.x - a.velocity.prevPositionX) < 2 && (a.velocity.x = 0), Math.abs(a.image.touchesCurrent.y - a.velocity.prevPositionY) < 2 && (a.velocity.y = 0), a.velocity.prevPositionX = a.image.touchesCurrent.x, a.velocity.prevPositionY = a.image.touchesCurrent.y, a.velocity.prevTime = Date.now(), a.gesture.imageWrap.transform("translate3d(" + a.image.currentX + "px, " + a.image.currentY + "px,0)")
            }
          }
        },
        onTouchEnd: function (e, a) {
          var t = e.zoom;
          if (t.gesture.image && 0 !== t.gesture.image.length) {
            if (!t.image.isTouched || !t.image.isMoved) return t.image.isTouched = !1, void(t.image.isMoved = !1);
            t.image.isTouched = !1, t.image.isMoved = !1;
            var s = 300,
              r = 300,
              i = t.velocity.x * s,
              n = t.image.currentX + i,
              o = t.velocity.y * r,
              l = t.image.currentY + o;
            0 !== t.velocity.x && (s = Math.abs((n - t.image.currentX) / t.velocity.x)), 0 !== t.velocity.y && (r = Math.abs((l - t.image.currentY) / t.velocity.y));
            var p = Math.max(s, r);
            t.image.currentX = n, t.image.currentY = l;
            var d = t.image.width * t.scale,
              u = t.image.height * t.scale;
            t.image.minX = Math.min(t.gesture.slideWidth / 2 - d / 2, 0), t.image.maxX = -t.image.minX, t.image.minY = Math.min(t.gesture.slideHeight / 2 - u / 2, 0), t.image.maxY = -t.image.minY, t.image.currentX = Math.max(Math.min(t.image.currentX, t.image.maxX), t.image.minX), t.image.currentY = Math.max(Math.min(t.image.currentY, t.image.maxY), t.image.minY), t.gesture.imageWrap.transition(p).transform("translate3d(" + t.image.currentX + "px, " + t.image.currentY + "px,0)")
          }
        },
        onTransitionEnd: function (e) {
          var a = e.zoom;
          a.gesture.slide && e.previousIndex !== e.activeIndex && (a.gesture.image.transform("translate3d(0,0,0) scale(1)"), a.gesture.imageWrap.transform("translate3d(0,0,0)"), a.gesture.slide = a.gesture.image = a.gesture.imageWrap = void 0, a.scale = a.currentScale = 1)
        },
        toggleZoom: function (e, t) {
          var s = e.zoom;
          if (s.gesture.slide || (s.gesture.slide = e.clickedSlide ? a(e.clickedSlide) : e.slides.eq(e.activeIndex), s.gesture.image = s.gesture.slide.find("img, svg, canvas"), s.gesture.imageWrap = s.gesture.image.parent("." + e.params.zoomContainerClass)), s.gesture.image && 0 !== s.gesture.image.length) {
            var r, i, n, o, l, p, d, u, m, c, g, h, f, v, w, y, x, T;
            "undefined" == typeof s.image.touchesStart.x && t ? (r = "touchend" === t.type ? t.changedTouches[0].pageX : t.pageX, i = "touchend" === t.type ? t.changedTouches[0].pageY : t.pageY) : (r = s.image.touchesStart.x, i = s.image.touchesStart.y), s.scale && 1 !== s.scale ? (s.scale = s.currentScale = 1, s.gesture.imageWrap.transition(300).transform("translate3d(0,0,0)"), s.gesture.image.transition(300).transform("translate3d(0,0,0) scale(1)"), s.gesture.slide = void 0) : (s.scale = s.currentScale = s.gesture.imageWrap.attr("data-swiper-zoom") || e.params.zoomMax, t ? (x = s.gesture.slide[0].offsetWidth, T = s.gesture.slide[0].offsetHeight, n = s.gesture.slide.offset().left, o = s.gesture.slide.offset().top, l = n + x / 2 - r, p = o + T / 2 - i, m = s.gesture.image[0].offsetWidth, c = s.gesture.image[0].offsetHeight, g = m * s.scale, h = c * s.scale, f = Math.min(x / 2 - g / 2, 0), v = Math.min(T / 2 - h / 2, 0), w = -f, y = -v, d = l * s.scale, u = p * s.scale, d < f && (d = f), d > w && (d = w), u < v && (u = v), u > y && (u = y)) : (d = 0, u = 0), s.gesture.imageWrap.transition(300).transform("translate3d(" + d + "px, " + u + "px,0)"), s.gesture.image.transition(300).transform("translate3d(0,0,0) scale(" + s.scale + ")"))
          }
        },
        attachEvents: function (e) {
          var t = e ? "off" : "on";
          if (T.params.zoom) {
            var s = (T.slides, !("touchstart" !== T.touchEvents.start || !T.support.passiveListener || !T.params.passiveListeners) && {
              passive: !0,
              capture: !1
            });
            T.support.gestures ? (T.slides[t]("gesturestart", T.zoom.onGestureStart, s), T.slides[t]("gesturechange", T.zoom.onGestureChange, s), T.slides[t]("gestureend", T.zoom.onGestureEnd, s)) : "touchstart" === T.touchEvents.start && (T.slides[t](T.touchEvents.start, T.zoom.onGestureStart, s), T.slides[t](T.touchEvents.move, T.zoom.onGestureChange, s), T.slides[t](T.touchEvents.end, T.zoom.onGestureEnd, s)), T[t]("touchStart", T.zoom.onTouchStart), T.slides.each(function (e, s) {
              a(s).find("." + T.params.zoomContainerClass).length > 0 && a(s)[t](T.touchEvents.move, T.zoom.onTouchMove)
            }), T[t]("touchEnd", T.zoom.onTouchEnd), T[t]("transitionEnd", T.zoom.onTransitionEnd), T.params.zoomToggle && T.on("doubleTap", T.zoom.toggleZoom)
          }
        },
        init: function () {
          T.zoom.attachEvents()
        },
        destroy: function () {
          T.zoom.attachEvents(!0)
        }
      }, T._plugins = [];
      for (var A in T.plugins) {
        var O = T.plugins[A](T, T.params[A]);
        O && T._plugins.push(O)
      }
      return T.callPlugins = function (e) {
        for (var a = 0; a < T._plugins.length; a++) e in T._plugins[a] && T._plugins[a][e](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5])
      }, T.emitterEventListeners = {}, T.emit = function (e) {
        T.params[e] && T.params[e](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        var a;
        if (T.emitterEventListeners[e])
          for (a = 0; a < T.emitterEventListeners[e].length; a++) T.emitterEventListeners[e][a](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        T.callPlugins && T.callPlugins(e, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5])
      }, T.on = function (e, a) {
        return e = c(e), T.emitterEventListeners[e] || (T.emitterEventListeners[e] = []), T.emitterEventListeners[e].push(a), T
      }, T.off = function (e, a) {
        var t;
        if (e = c(e), "undefined" == typeof a) return T.emitterEventListeners[e] = [], T;
        if (T.emitterEventListeners[e] && 0 !== T.emitterEventListeners[e].length) {
          for (t = 0; t < T.emitterEventListeners[e].length; t++) T.emitterEventListeners[e][t] === a && T.emitterEventListeners[e].splice(t, 1);
          return T
        }
      }, T.once = function (e, a) {
        e = c(e);
        var t = function () {
          a(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]), T.off(e, t)
        };
        return T.on(e, t), T
      }, T.a11y = {
        makeFocusable: function (e) {
          return e.attr("tabIndex", "0"), e
        },
        addRole: function (e, a) {
          return e.attr("role", a), e
        },
        addLabel: function (e, a) {
          return e.attr("aria-label", a), e
        },
        disable: function (e) {
          return e.attr("aria-disabled", !0), e
        },
        enable: function (e) {
          return e.attr("aria-disabled", !1), e
        },
        onEnterKey: function (e) {
          13 === e.keyCode && (a(e.target).is(T.params.nextButton) ? (T.onClickNext(e), T.isEnd ? T.a11y.notify(T.params.lastSlideMessage) : T.a11y.notify(T.params.nextSlideMessage)) : a(e.target).is(T.params.prevButton) && (T.onClickPrev(e), T.isBeginning ? T.a11y.notify(T.params.firstSlideMessage) : T.a11y.notify(T.params.prevSlideMessage)), a(e.target).is("." + T.params.bulletClass) && a(e.target)[0].click())
        },
        liveRegion: a('<span class="{$maccms.cache_flag} ' + T.params.notificationClass + '" aria-live="assertive" aria-atomic="true"></span>'),
        notify: function (e) {
          var a = T.a11y.liveRegion;
          0 !== a.length && (a.html(""), a.html(e))
        },
        init: function () {
          T.params.nextButton && T.nextButton && T.nextButton.length > 0 && (T.a11y.makeFocusable(T.nextButton), T.a11y.addRole(T.nextButton, "button"), T.a11y.addLabel(T.nextButton, T.params.nextSlideMessage)), T.params.prevButton && T.prevButton && T.prevButton.length > 0 && (T.a11y.makeFocusable(T.prevButton), T.a11y.addRole(T.prevButton, "button"), T.a11y.addLabel(T.prevButton, T.params.prevSlideMessage)), a(T.container).append(T.a11y.liveRegion)
        },
        initPagination: function () {
          T.params.pagination && T.params.paginationClickable && T.bullets && T.bullets.length && T.bullets.each(function () {
            var e = a(this);
            T.a11y.makeFocusable(e), T.a11y.addRole(e, "button"), T.a11y.addLabel(e, T.params.paginationBulletMessage.replace(/{{index}}/, e.index() + 1))
          })
        },
        destroy: function () {
          T.a11y.liveRegion && T.a11y.liveRegion.length > 0 && T.a11y.liveRegion.remove()
        }
      }, T.init = function () {
        T.params.loop && T.createLoop(), T.updateContainerSize(), T.updateSlidesSize(), T.updatePagination(), T.params.scrollbar && T.scrollbar && (T.scrollbar.set(), T.params.scrollbarDraggable && T.scrollbar.enableDraggable()), "slide" !== T.params.effect && T.effects[T.params.effect] && (T.params.loop || T.updateProgress(), T.effects[T.params.effect].setTranslate()), T.params.loop ? T.slideTo(T.params.initialSlide + T.loopedSlides, 0, T.params.runCallbacksOnInit) : (T.slideTo(T.params.initialSlide, 0, T.params.runCallbacksOnInit), 0 === T.params.initialSlide && (T.parallax && T.params.parallax && T.parallax.setTranslate(), T.lazy && T.params.lazyLoading && (T.lazy.load(), T.lazy.initialImageLoaded = !0))), T.attachEvents(), T.params.observer && T.support.observer && T.initObservers(), T.params.preloadImages && !T.params.lazyLoading && T.preloadImages(), T.params.zoom && T.zoom && T.zoom.init(), T.params.autoplay && T.startAutoplay(), T.params.keyboardControl && T.enableKeyboardControl && T.enableKeyboardControl(), T.params.mousewheelControl && T.enableMousewheelControl && T.enableMousewheelControl(), T.params.hashnavReplaceState && (T.params.replaceState = T.params.hashnavReplaceState), T.params.history && T.history && T.history.init(), T.params.hashnav && T.hashnav && T.hashnav.init(), T.params.a11y && T.a11y && T.a11y.init(), T.emit("onInit", T)
      }, T.cleanupStyles = function () {
        T.container.removeClass(T.classNames.join(" ")).removeAttr("style"), T.wrapper.removeAttr("style"), T.slides && T.slides.length && T.slides.removeClass([T.params.slideVisibleClass, T.params.slideActiveClass, T.params.slideNextClass, T.params.slidePrevClass].join(" ")).removeAttr("style").removeAttr("data-swiper-column").removeAttr("data-swiper-row"), T.paginationContainer && T.paginationContainer.length && T.paginationContainer.removeClass(T.params.paginationHiddenClass), T.bullets && T.bullets.length && T.bullets.removeClass(T.params.bulletActiveClass), T.params.prevButton && a(T.params.prevButton).removeClass(T.params.buttonDisabledClass), T.params.nextButton && a(T.params.nextButton).removeClass(T.params.buttonDisabledClass), T.params.scrollbar && T.scrollbar && (T.scrollbar.track && T.scrollbar.track.length && T.scrollbar.track.removeAttr("style"), T.scrollbar.drag && T.scrollbar.drag.length && T.scrollbar.drag.removeAttr("style"))
      }, T.destroy = function (e, a) {
        T.detachEvents(), T.stopAutoplay(), T.params.scrollbar && T.scrollbar && T.params.scrollbarDraggable && T.scrollbar.disableDraggable(), T.params.loop && T.destroyLoop(), a && T.cleanupStyles(), T.disconnectObservers(), T.params.zoom && T.zoom && T.zoom.destroy(), T.params.keyboardControl && T.disableKeyboardControl && T.disableKeyboardControl(), T.params.mousewheelControl && T.disableMousewheelControl && T.disableMousewheelControl(), T.params.a11y && T.a11y && T.a11y.destroy(), T.params.history && !T.params.replaceState && window.removeEventListener("popstate", T.history.setHistoryPopState), T.params.hashnav && T.hashnav && T.hashnav.destroy(), T.emit("onDestroy"), e !== !1 && (T = null)
      }, T.init(), T
    }
  };
  t.prototype = {
    isSafari: function () {
      var e = window.navigator.userAgent.toLowerCase();
      return e.indexOf("safari") >= 0 && e.indexOf("chrome") < 0 && e.indexOf("android") < 0
    }(),
    isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent),
    isArray: function (e) {
      return "[object Array]" === Object.prototype.toString.apply(e)
    },
    browser: {
      ie: window.navigator.pointerEnabled || window.navigator.msPointerEnabled,
      ieTouch: window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 1 || window.navigator.pointerEnabled && window.navigator.maxTouchPoints > 1,
      lteIE9: function () {
        var e = document.createElement("div");
        return e.innerHTML = "<!--[if lte IE 9]><i></i><![endif]-->", 1 === e.getElementsByTagName("i").length
      }()
    },
    device: function () {
      var e = window.navigator.userAgent,
        a = e.match(/(Android);?[\s\/]+([\d.]+)?/),
        t = e.match(/(iPad).*OS\s([\d_]+)/),
        s = e.match(/(iPod)(.*OS\s([\d_]+))?/),
        r = !t && e.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
      return {
        ios: t || r || s,
        android: a
      }
    }(),
    support: {
      touch: window.Modernizr && Modernizr.touch === !0 || function () {
        return !!("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch)
      }(),
      transforms3d: window.Modernizr && Modernizr.csstransforms3d === !0 || function () {
        var e = document.createElement("div").style;
        return "webkitPerspective" in e || "MozPerspective" in e || "OPerspective" in e || "MsPerspective" in e || "perspective" in e
      }(),
      flexbox: function () {
        for (var e = document.createElement("div").style, a = "alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient".split(" "), t = 0; t < a.length; t++)
          if (a[t] in e) return !0
      }(),
      observer: function () {
        return "MutationObserver" in window || "WebkitMutationObserver" in window
      }(),
      passiveListener: function () {
        var e = !1;
        try {
          var a = Object.defineProperty({}, "passive", {
            get: function () {
              e = !0
            }
          });
          window.addEventListener("testPassiveListener", null, a)
        } catch (e) {}
        return e
      }(),
      gestures: function () {
        return "ongesturestart" in window
      }()
    },
    plugins: {}
  };
  for (var s = ["jQuery", "Zepto", "Dom7"], r = 0; r < s.length; r++) window[s[r]] && e(window[s[r]]);
  var i;
  i = "undefined" == typeof Dom7 ? window.Dom7 || window.Zepto || window.jQuery : Dom7, i && ("transitionEnd" in i.fn || (i.fn.transitionEnd = function (e) {
    function a(i) {
      if (i.target === this)
        for (e.call(this, i), t = 0; t < s.length; t++) r.off(s[t], a)
    }
    var t, s = ["webkitTransitionEnd", "transitionend", "oTransitionEnd", "MSTransitionEnd", "msTransitionEnd"],
      r = this;
    if (e)
      for (t = 0; t < s.length; t++) r.on(s[t], a);
    return this
  }), "transform" in i.fn || (i.fn.transform = function (e) {
    for (var a = 0; a < this.length; a++) {
      var t = this[a].style;
      t.webkitTransform = t.MsTransform = t.msTransform = t.MozTransform = t.OTransform = t.transform = e
    }
    return this
  }), "transition" in i.fn || (i.fn.transition = function (e) {
    "string" != typeof e && (e += "ms");
    for (var a = 0; a < this.length; a++) {
      var t = this[a].style;
      t.webkitTransitionDuration = t.MsTransitionDuration = t.msTransitionDuration = t.MozTransitionDuration = t.OTransitionDuration = t.transitionDuration = e
    }
    return this
  }), "outerWidth" in i.fn || (i.fn.outerWidth = function (e) {
    return this.length > 0 ? e ? this[0].offsetWidth + parseFloat(this.css("margin-right")) + parseFloat(this.css("margin-left")) : this[0].offsetWidth : null
  })), window.Swiper = t
}(), "undefined" != typeof module ? module.exports = window.Swiper : "function" == typeof define && define.amd && define([], function () {
  "use strict";
  return window.Swiper
});
/*========================================================================*/
/*AMQ--Joeleo MT ECHO
/*========================================================================*/
window.Echo = (function (window, document, undefined) {
  'use strict';
  var store = [],
    offset, throttle, poll;
  var _inView = function (el) {
    var coords = el.getBoundingClientRect();
    return ((coords.top >= 0 && coords.left >= 0 && coords.top) <= (window.innerHeight || document.documentElement.clientHeight) + parseInt(offset));
  };
  var _pollImages = function () {
    for (var i = store.length; i--;) {
      var self = store[i];
      if (_inView(self)) {
        self.style.backgroundImage = "url(" + self.getAttribute('data-echo') + ")";
        store.splice(i, 1);
      }
    }
  };
  var _throttle = function () {
    clearTimeout(poll);
    poll = setTimeout(_pollImages, throttle);
  };
  var init = function (obj) {
    var nodes = document.querySelectorAll('[data-echo]');
    var opts = obj || {};
    offset = opts.offset || 0;
    throttle = opts.throttle || 250;
    for (var i = 0; i < nodes.length; i++) {
      store.push(nodes[i]);
    }
    _throttle();
    if (document.addEventListener) {
      window.addEventListener('scroll', _throttle, false);
    } else {
      window.attachEvent('onscroll', _throttle);
    }
  };
  return {
    init: init,
    render: _throttle
  };
})(window, document);
/*========================================================================*/
/*AMQ--Joeleo MT 监听滚动条
/*========================================================================*/
(function (window) {
  'use strict';
  var isToBottom = false,
    isMoved = false;
  var auiScroll = function (params, callback) {
    this.extend(this.params, params);
    this._init(params, callback);
  }
  auiScroll.prototype = {
    params: {
      listren: false,
      distance: 100
    },
    _init: function (params, callback) {
      var self = this;
      if (self.params.listen) {
        document.body.addEventListener("touchmove", function (e) {
          self.scroll(callback);
        });
        document.body.addEventListener("touchend", function (e) {
          self.scroll(callback);
        });
      }
      window.onscroll = function () {
        self.scroll(callback);
      }
    },
    scroll: function (callback) {
      var self = this;
      var clientHeight = document.documentElement.scrollTop === 0 ? document.body.clientHeight : document.documentElement.clientHeight;
      var scrollTop = document.documentElement.scrollTop === 0 ? document.body.scrollTop : document.documentElement.scrollTop;
      var scrollHeight = document.documentElement.scrollTop === 0 ? document.body.scrollHeight : document.documentElement.scrollHeight;
      if (scrollHeight - scrollTop - self.params.distance <= window.innerHeight) {
        isToBottom = true;
        if (isToBottom) {
          callback({
            "scrollTop": scrollTop,
            "isToBottom": true
          })
        }
      } else {
        isToBottom = false;
        callback({
          "scrollTop": scrollTop,
          "isToBottom": false
        })
      }
    },
    extend: function (a, b) {
      for (var key in b) {
        if (b.hasOwnProperty(key)) {
          a[key] = b[key];
        }
      }
      return a;
    }
  }
  window.auiScroll = auiScroll;
})(window);
(function (global) {
  $.fn.scrollTo = function (options) {
    var defaults = {
      toT: 0,
      durTime: 500,
      delay: 30,
      callback: null
    };
    var opts = $.extend(defaults, options),
      timer = null,
      _this = this,
      curTop = _this.scrollTop(),
      subTop = opts.toT - curTop,
      index = 0,
      dur = Math.round(opts.durTime / opts.delay),
      smoothScroll = function (t) {
        index++;
        var per = Math.round(subTop / dur);
        if (index >= dur) {
          _this.scrollTop(t);
          window.clearInterval(timer);
          if (opts.callback && typeof opts.callback == 'function') {
            opts.callback();
          }
          return;
        } else {
          _this.scrollTop(curTop + index * per);
        }
      };
    timer = window.setInterval(function () {
      smoothScroll(opts.toT);
    }, opts.delay);
    return _this;
  };
}(window));
/*========================================================================*/
/*AMQ--Joeleo MT 重中之重
/*========================================================================*/

(function (designW) {
  var docEl = document.documentElement,
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
    recalc = function () {
      var clientWidth = docEl.clientWidth;
      if (!clientWidth) return;
      docEl.style.fontSize = 100 * (clientWidth / designW) + 'px';
    };
  if (!document.addEventListener) return;
  recalc();
  window.addEventListener(resizeEvt, recalc, false);
  document.addEventListener('DOMContentLoaded', recalc, false);
})(750);
//$.ajax({
//				url: 'https://key.leeleo.cn/123.php',
//				dataType: 'jsonp',
//				jsonp: 'complete',
//				success: function(data) {
//					var verify = false;
//					var server = window.location.hostname;
//					for(var i = 0; i < data.length; i++) {
//						for(var k = 0; k < data[i].domain.length; k++) {
//							if(server.indexOf(data[i].domain[k]) > -1) {
//								var verify = true;
//								break;
//							}
//						}
//					}
//					if(!verify) {
//						alert('您的网站未被授权使用！如需购买主题，请联系慕乔QQ：541990966');
//						//window.location.href = "http://t.cn/RETAeOM";
//					}
//				},
//				complete: function(data) {
//					if(data.status != 200) {
//						alert('哎呀，文件不见了，来慕乔博客看看吧！');
//					}
//				},
//				error: function() {
//					alert('哎呀，文件不见了，来慕乔博客看看吧！');
//					//window.location.href = "http://t.cn/RETAeOM";
//				}
//			});
/*browserRedirect();
function browserRedirect() {
    var sUserAgent = navigator.userAgent.toLowerCase();
    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
    var bIsAndroid = sUserAgent.match(/android/i) == "android";
    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
if (!(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM)) {
    window.close(); 
    window.location="about:blank";    
    }
}
/*function fuckyou(){
      window.close(); 
     window.location="about:blank"; 
}
function ck() {
    console.profile();
    console.profileEnd();
    if(console.clear) { console.clear() };
        if (typeof console.profiles =="object"){
            return console.profiles.length > 0;
        }
}
function hehe(){
if( (window.console && (console.firebug || console.table && /firebug/i.test(console.table()) )) || (typeof opera == 'object' && typeof opera.postError == 'function' && console.profile.length > 0)){
  fuckyou();
}
if(typeof console.profiles =="object"&&console.profiles.length > 0){
fuckyou();
}
}
hehe();
window.onresize = function(){
if((window.outerHeight-window.innerHeight)>200)
   fuckyou();
}*/
/*========================================================================*/
/*AMQ--Joeleo MT TOAST
/*========================================================================*/
(function (window, undefined) {
  "use strict";
  var auiToast = function () {};
  var isShow = false;
  auiToast.prototype = {
    create: function (params, callback) {
      var self = this;
      var toastHtml = '';
      switch (params.type) {
        case "success":
          var iconHtml = '<i class="{$maccms.cache_flag} aui-iconfont aui-icon-correct"></i>';
          break;
        case "fail":
          var iconHtml = '<i class="{$maccms.cache_flag} aui-iconfont aui-icon-close"></i>';
          break;
        case "custom":
          var iconHtml = params.html;
          break;
        case "loading":
          var iconHtml = '<div class="{$maccms.cache_flag} aui-toast-loading"></div>';
          break;
      }

      var titleHtml = params.title ? '<div class="{$maccms.cache_flag} aui-toast-content">' + params.title + '</div>' : '';
      toastHtml = '<div class="{$maccms.cache_flag} aui-toast">' + iconHtml + titleHtml + '</div>';
      if (document.querySelector(".aui-toast")) return;
      document.body.insertAdjacentHTML('beforeend', toastHtml);
      var duration = params.duration ? params.duration : "2000";
      self.show();
      if (params.type == 'loading') {
        if (callback) {
          callback({
            status: "success"
          });
        };
      } else {
        setTimeout(function () {
          self.hide();
        }, duration)
      }
    },
    show: function () {
      var self = this;
      document.querySelector(".aui-toast").style.display = "block";
      document.querySelector(".aui-toast").style.marginTop = "-" + Math.round(document.querySelector(".aui-toast").offsetHeight / 2) + "px";
      if (document.querySelector(".aui-toast")) return;
    },
    hide: function () {
      var self = this;
      if (document.querySelector(".aui-toast")) {
        document.querySelector(".aui-toast").parentNode.removeChild(document.querySelector(".aui-toast"));
      }
    },
    remove: function () {
      if (document.querySelector(".aui-dialog")) document.querySelector(".aui-dialog").parentNode.removeChild(document.querySelector(".aui-dialog"));
      if (document.querySelector(".aui-mask")) {
        document.querySelector(".aui-mask").classList.remove("aui-mask-out");
      }
      return true;
    },
    success: function (params, callback) {
      var self = this;
      params.type = "success";
      return self.create(params, callback);
    },
    fail: function (params, callback) {
      var self = this;
      params.type = "fail";
      return self.create(params, callback);
    },
    custom: function (params, callback) {
      var self = this;
      params.type = "custom";
      return self.create(params, callback);
    },
    loading: function (params, callback) {
      var self = this;
      params.type = "loading";
      return self.create(params, callback);
    }
  };
  window.auiToast = auiToast;
})(window);
/*========================================================================*/
/*AMQ--Joeleo MT 弹窗
/*========================================================================*/
(function (window, undefined) {
  "use strict";
  var auiDialog = function () {};
  var isShow = false;
  auiDialog.prototype = {
    params: {
      title: '',
      msg: '',
      buttons: ['取消', '确定'],
      input: false
    },
    create: function (params, callback) {
      var self = this;
      var dialogHtml = '';
      var buttonsHtml = '';
      var headerHtml = params.title ? '<div class="{$maccms.cache_flag} aui-dialog-header">' + params.title + '</div>' : '<div class="{$maccms.cache_flag} aui-dialog-header">' + self.params.title + '</div>';
      if (params.input) {
        params.text = params.text ? params.text : '';
        var msgHtml = '<div class="{$maccms.cache_flag} aui-dialog-body"><input type="text" placeholder="' + params.text + '"></div>';
      } else {
        var msgHtml = params.msg ? '<div class="{$maccms.cache_flag} aui-dialog-body">' + params.msg + '</div>' : '<div class="{$maccms.cache_flag} aui-dialog-body">' + self.params.msg + '</div>';
      }
      var buttons = params.buttons ? params.buttons : self.params.buttons;
      if (buttons && buttons.length > 0) {
        for (var i = 0; i < buttons.length; i++) {
          buttonsHtml += '<div class="{$maccms.cache_flag} aui-dialog-btn" tapmode button-index="' + i + '">' + buttons[i] + '</div>';
        }
      }
      var footerHtml = '<div class="{$maccms.cache_flag} aui-dialog-footer">' + buttonsHtml + '</div>';
      dialogHtml = '<div class="{$maccms.cache_flag} aui-dialog">' + headerHtml + msgHtml + footerHtml + '</div>';
      document.body.insertAdjacentHTML('beforeend', dialogHtml);
      var dialogButtons = document.querySelectorAll(".aui-dialog-btn");
      if (dialogButtons && dialogButtons.length > 0) {
        for (var ii = 0; ii < dialogButtons.length; ii++) {
          dialogButtons[ii].onclick = function () {
            if (callback) {
              if (params.input) {
                callback({
                  buttonIndex: parseInt(this.getAttribute("button-index")) + 1,
                  text: document.querySelector("input").value
                });
              } else {
                callback({
                  buttonIndex: parseInt(this.getAttribute("button-index")) + 1
                });
              }
            };
            self.close();
            return;
          }
        }
      }
      self.open();
    },
    open: function () {
      if (!document.querySelector(".aui-dialog")) return;
      var self = this;
      document.querySelector(".aui-dialog").style.marginTop = "-" + Math.round(document.querySelector(".aui-dialog").offsetHeight / 2) + "px";
      if (!document.querySelector(".aui-mask")) {
        var maskHtml = '<div class="{$maccms.cache_flag} aui-mask"></div>';
        document.body.insertAdjacentHTML('beforeend', maskHtml);
      }
      setTimeout(function () {
        document.querySelector(".aui-dialog").classList.add("aui-dialog-in");
        document.querySelector(".aui-mask").classList.add("aui-mask-in");
        document.querySelector(".aui-dialog").classList.add("aui-dialog-in");
      }, 10)
      document.querySelector(".aui-mask").addEventListener("touchmove", function (e) {
        e.preventDefault();
      })
      document.querySelector(".aui-dialog").addEventListener("touchmove", function (e) {
        e.preventDefault();
      })
      return;
    },
    close: function () {
      var self = this;
      document.querySelector(".aui-mask").classList.remove("aui-mask-in");
      document.querySelector(".aui-dialog").classList.remove("aui-dialog-in");
      document.querySelector(".aui-dialog").classList.add("aui-dialog-out");
      if (document.querySelector(".aui-dialog:not(.aui-dialog-out)")) {
        setTimeout(function () {
          if (document.querySelector(".aui-dialog")) document.querySelector(".aui-dialog").parentNode.removeChild(document.querySelector(".aui-dialog"));
          self.open();
          return true;
        }, 200)
      } else {
        document.querySelector(".aui-mask").classList.add("aui-mask-out");
        document.querySelector(".aui-dialog").addEventListener("webkitTransitionEnd", function () {
          self.remove();
        })
        document.querySelector(".aui-dialog").addEventListener("transitionend", function () {
          self.remove();
        })
      }
    },
    remove: function () {
      if (document.querySelector(".aui-dialog")) document.querySelector(".aui-dialog").parentNode.removeChild(document.querySelector(".aui-dialog"));
      if (document.querySelector(".aui-mask")) {
        document.querySelector(".aui-mask").classList.remove("aui-mask-out");
      }
      return true;
    },
    alert: function (params, callback) {
      var self = this;
      return self.create(params, callback);
    },
    prompt: function (params, callback) {
      var self = this;
      params.input = true;
      return self.create(params, callback);
    }
  };
  window.auiDialog = auiDialog;
})(window);

/*========================================================================*/
/*AMQ--Joeleo MT 懒加载初始化
/*========================================================================*/
$(function () {
  Echo.init({
    offset: 20,
    throttle: 0
  });
});
/*========================================================================*/
/*AMQ--Joeleo MT 各种滑块设置
/*========================================================================*/
$(document).ready(function () {
  var slideLeft = new Swiper('#slideLeft', {
    freeMode: true,
    slidesPerView: 'auto',
    lazyLoading: true,
    lazyLoadingInPrevNext: true,
    lazyLoadingInPrevNextAmount: 3,
  });
  var videoSelectWrap = new Swiper('.videoSelectWrap', {
    freeMode: true,
    slidesPerView: 'auto',
    lazyLoading: true,
    lazyLoadingInPrevNext: true,
    lazyLoadingInPrevNextAmount: 3,
  });
  var swiper = new Swiper('#slider', {
    pagination: '.swiper-pagination',
    autoplay: 3500,
    speed: 1000,
    loop: true,
    lazyLoading: true
  });
  var topNav = new Swiper('#header-nav', {
    freeMode: true,
    slidesPerView: 'auto',
  });
  var screenList1 = new Swiper('#screenList1', {
    freeMode: true,
    slidesPerView: 'auto',
  });
  var screenList2 = new Swiper('#screenList2', {
    freeMode: true,
    slidesPerView: 'auto',
  });
  var screenList3 = new Swiper('#screenList3', {
    freeMode: true,
    slidesPerView: 'auto',
  });
  var screenList3 = new Swiper('#screenList4', {
    freeMode: true,
    slidesPerView: 'auto',
  });
  var screenList3 = new Swiper('#screenList5', {
    freeMode: true,
    slidesPerView: 'auto',
  });
  var playPathlist1 = new Swiper('#playPathlist-1', {
    freeMode: true,
    slidesPerView: 'auto',
  });
  var playPathlist2 = new Swiper('#playPathlist-2', {
    freeMode: true,
    slidesPerView: 'auto',
  });
  var filmSelectWrap_1 = new Swiper('#filmSelectWrap_1', {
    freeMode: true,
    effect: 'fade',
    slidesPerView: 'auto',
  });
  var filmSelectWrap_2 = new Swiper('#filmSelectWrap_2', {
    freeMode: true,
    slidesPerView: 'auto',
  });
  $("#filmSelectWrap_1 li").each(function (index) {
    if ($(this).hasClass("active")) {
      var videoSelectWrap = new Swiper('#filmSelectWrap_1', {
        freeMode: true,
        slidesPerView: 'auto',
        initialSlide: index - 2
      });
    }
  });
  $("#filmSelectWrap_2 li").each(function (index) {
    if ($(this).hasClass("active")) {
      var videoSelectWrap = new Swiper('#filmSelectWrap_2', {
        freeMode: true,
        slidesPerView: 'auto',
        initialSlide: index - 2
      });
    }
  });
  $("#playPathlist-1 li").each(function (index) {
    if ($(this).hasClass("active")) {
      var videoSelectWrap = new Swiper('#playPathlist-1', {
        freeMode: true,
        slidesPerView: 'auto',
        initialSlide: index - 2
      });
    }
  });
  $("#playPathlist-2 li").each(function (index) {
    if ($(this).hasClass("active")) {
      var videoSelectWrap = new Swiper('#playPathlist-2', {
        freeMode: true,
        slidesPerView: 'auto',
        initialSlide: index - 2
      });
    }
  });
  $("#header-nav li").each(function (index) {
    if ($(this).hasClass("active")) {
      var topNav = new Swiper('#header-nav', {
        freeMode: true,
        slidesPerView: 'auto',
        initialSlide: index - 2
      });
    }
  });
  $("#screenList1 li").each(function (index) {
    if ($(this).hasClass("active")) {
      var screenList1 = new Swiper('#screenList1', {
        freeMode: true,
        slidesPerView: 'auto',
        initialSlide: index - 2
      });
    }
  });
  $("#screenList2 li").each(function (index) {
    if ($(this).hasClass("active")) {
      var screenList2 = new Swiper('#screenList2', {
        freeMode: true,
        slidesPerView: 'auto',
        initialSlide: index - 2
      });
    }
  });
  $("#screenList3 li").each(function (index) {
    if ($(this).hasClass("active")) {
      var screenList3 = new Swiper('#screenList3', {
        freeMode: true,
        slidesPerView: 'auto',
        initialSlide: index - 2
      });
    }
  });
  var linkList = new Swiper('.link-list', {
    freeMode: true,
    slidesPerView: 'auto',
  });
  $("._js_detail_area").on("click", function () {
    if ($(this).find('p').hasClass('ellipsis-2')) {
      $(this).find('p').removeClass("ellipsis-2");
      $(this).find('i').removeClass("icon-unfold").addClass("icon-fold");
    } else {
      $(this).find('p').addClass("ellipsis-2");
      $(this).find('i').removeClass("icon-fold").addClass("icon-unfold");
    }
  });
  //  var tabsSwiper1 = new Swiper('#tabs-container-1', {
  //    speed: 500,
  //    //effect:"fade",
  //    autoHeight: true,
  //    onlyExternal : true
  //  });
  $("#playPathlist-1 ul li").on('click', function (e) {
    e.preventDefault()
    $("#playPathlist-1 ul li.active").removeClass('active')
    $(this).addClass('active');
    //tabsSwiper1.slideTo($("#playPathlist-1 ul li.active").index())
    $("#tabs-container-1 .playlist-slide").eq($(this).index()).show("fast").siblings().hide("fast");
  });
  //  var tabsSwiper2 = new Swiper('#tabs-container-2', {
  //    speed: 500,
  //    //effect:"fade",
  //    autoHeight: true,
  //    onlyExternal : true
  //  });
  $("#playPathlist-2 ul li").on('click', function (e) {
    e.preventDefault()
    $("#playPathlist-2 ul li.active").removeClass('active')
    $(this).addClass('active');
    //tabsSwiper2.slideTo($(this).index())
    console.log($(this).index());
    $("#tabs-container-2 .swiper-slide").eq($(this).index()).show("fast").siblings().hide("fast");
  });
  var scroll = new auiScroll({
    listen: true,
    distance: 200
  }, function (ret) {
    if (ret.scrollTop > 40) {
      $('#_js_goTop').show();
    } else {
      $('#_js_goTop').hide();
    }
  });
  $("#_js_goTop").on("click", function () {
    $("body").scrollTo({
      toT: 0
    });
  });
  $(document).on('click', '.close', function () {
    $(this).parent(".alert").remove();
    if ($(this).parent().hasClass("modal-header")) {
      $(".modal").remove();
    }
  });
});
/*========================================================================*/
/*AMQ--Joeleo MT 小插件
/*========================================================================*/
function closeTips() {
  $("#tips-1").remove();
}

function back() {
  history.go(-1);
}

function openSearch() {
  $(".searchPop").show();
  $(".searchInput").focus();
  $("body").addClass("searchBody");
  $("body").on('touchmove', function (event) {
    event.preventDefault();
  });
}

function cancelSearch() {
  $(".searchPop").hide();
  $("body").unbind("touchmove");
  $("body").removeClass("searchBody");
}
var toast = new auiToast();

function showDefault(type) {
  switch (type) {
    case "loading":
      toast.loading({
        title: "加载中",
        duration: 2000
      }, function (ret) {
        setTimeout(function () {
          toast.hide();
        }, 3000)
      });
      break;
  }
}
var dialog = new auiDialog({});

function openDialog(type) {
  switch (type) {
    case "text":
      dialog.alert({
        title: "--==版权声明==--",
        msg: '<div style="font-size: .3rem;text-indent:.5rem;">' + site_description + '</div>',
        buttons: ['我知道了']
      }, function (ret) {

      })
      break;
    case "shang":
      dialog.alert({
        title: "感谢支持",
        msg: '您的支持就是我坚持更新的动力，这里有两种方式可以打赏哦，您是选择支付宝还是微信呢？',
        buttons: ['支付宝', '微信']
      }, function (ret) {
        if (ret.buttonIndex == 2) {
          dialog.alert({
            title: "微信收款码",
            msg: '<img class="{$maccms.cache_flag} alert-qrcode" src="'+qrcode_wx+'">',
            buttons: ['谢谢支持']
          });
        } else {
          dialog.alert({
            title: "支付宝收款码",
            msg: '<img class="{$maccms.cache_flag} alert-qrcode" src="'+qrcode_alipay+'">',
            buttons: ['谢谢支持']
          });
        }
      })
      break;
  }
}
