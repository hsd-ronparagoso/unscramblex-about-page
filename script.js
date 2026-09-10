(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- long paragraph disclosure ---------- */
  (function () {
    var minimumCharacters = 260;
    var paragraphs = document.querySelectorAll("main p, .hero p");

    function addGroupToggle(group) {
      if (group.dataset.expandableReady || group.textContent.trim().length < minimumCharacters) return;
      var firstParagraph = group.querySelector("p");
      if (!firstParagraph || group.scrollHeight <= firstParagraph.scrollHeight) return;

      group.dataset.expandableReady = "true";
      var collapsedHeight = firstParagraph.offsetTop + firstParagraph.offsetHeight + 8;
      group.classList.add("is-collapsed");
      group.style.height = collapsedHeight + "px";
      group.style.maxHeight = collapsedHeight + "px";

      var button = document.createElement("button");
      button.type = "button";
      button.className = "show-more-btn";
      button.setAttribute("aria-expanded", "false");
      button.innerHTML = 'Show More <svg viewBox="0 0 30 30" aria-hidden="true"><path d="M5 10.5L15 20.5L25 10.5"></path></svg>';
      group.insertAdjacentElement("afterend", button);

      button.addEventListener("click", function () {
        var expanded = group.classList.toggle("is-expanded");
        button.setAttribute("aria-expanded", String(expanded));
        button.firstChild.textContent = expanded ? "Show Less " : "Show More ";
        group.style.height = expanded ? group.scrollHeight + "px" : collapsedHeight + "px";
        group.style.maxHeight = expanded ? group.scrollHeight + "px" : collapsedHeight + "px";
      });
    }

    function addToggle(paragraph) {
      if (paragraph.closest("[data-expandable-group], [data-no-expand], .section-head") || paragraph.dataset.expandableReady || paragraph.textContent.trim().length < minimumCharacters) return;
      var styles = window.getComputedStyle(paragraph);
      var lineHeight = parseFloat(styles.lineHeight);
      if (!lineHeight || paragraph.scrollHeight <= lineHeight * 5.2) return;

      paragraph.dataset.expandableReady = "true";
      paragraph.classList.add("expandable-copy");
      var section = paragraph.closest(".on-wash, .cta-band");
      var fadeBackground = section && section.classList.contains("on-wash") ? "var(--wash-1)" : "var(--paper)";
      paragraph.style.setProperty("--fade-bg", fadeBackground);
      paragraph.style.maxHeight = (lineHeight * 5.2) + "px";

      var button = document.createElement("button");
      button.type = "button";
      button.className = "show-more-btn";
      button.setAttribute("aria-expanded", "false");
      button.innerHTML = 'Show More <svg viewBox="0 0 30 30" aria-hidden="true"><path d="M5 10.5L15 20.5L25 10.5"></path></svg>';
      paragraph.insertAdjacentElement("afterend", button);

      button.addEventListener("click", function () {
        var expanded = paragraph.classList.toggle("is-expanded");
        button.setAttribute("aria-expanded", String(expanded));
        button.firstChild.textContent = expanded ? "Show Less " : "Show More ";
        paragraph.style.maxHeight = expanded ? paragraph.scrollHeight + "px" : (lineHeight * 5.2) + "px";
      });
    }

    function scan() {
      document.querySelectorAll("[data-expandable-group]").forEach(addGroupToggle);
      paragraphs.forEach(addToggle);
    }

    scan();
    document.querySelectorAll("[data-tab-btn]").forEach(function (tab) {
      tab.addEventListener("click", function () { setTimeout(scan, 0); });
    });
    window.addEventListener("resize", function () {
      scan();
      document.querySelectorAll(".expandable-copy").forEach(function (paragraph) {
        if (!paragraph.classList.contains("is-expanded")) {
          var lineHeight = parseFloat(window.getComputedStyle(paragraph).lineHeight);
          paragraph.style.maxHeight = (lineHeight * 5.2) + "px";
        }
      });
      document.querySelectorAll(".expandable-group:not(.is-expanded)").forEach(function (group) {
        var firstParagraph = group.querySelector("p");
        if (firstParagraph) {
          var collapsedHeight = firstParagraph.offsetTop + firstParagraph.offsetHeight + 8;
          group.style.height = collapsedHeight + "px";
          group.style.maxHeight = collapsedHeight + "px";
        }
      });
    });
  })();

  /* ---------- header dropdowns ---------- */
  document.querySelectorAll("[data-menu-btn]").forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var willOpen = !panel.classList.contains("is-open");
      document.querySelectorAll(".nav-panel.is-open").forEach(function (p) {
        p.classList.remove("is-open");
        var b = document.querySelector('[aria-controls="' + p.id + '"]');
        if (b) b.setAttribute("aria-expanded", "false");
      });
      panel.classList.toggle("is-open", willOpen);
      btn.setAttribute("aria-expanded", String(willOpen));
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll(".nav-panel.is-open").forEach(function (p) {
      p.classList.remove("is-open");
      var b = document.querySelector('[aria-controls="' + p.id + '"]');
      if (b) b.setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".nav-panel.is-open").forEach(function (p) { p.classList.remove("is-open"); });
      document.querySelectorAll("[data-menu-btn]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    }
  });

  var mobileBtn = document.querySelector("[data-mobile-btn]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");
  if (mobileBtn && mobilePanel) {
    mobileBtn.addEventListener("click", function () {
      var open = mobilePanel.classList.toggle("is-open");
      mobileBtn.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------- header shrink + scroll progress (rAF throttled) ---------- */
  var header = document.querySelector("[data-site-header]");
  var progressBar = document.querySelector("[data-scroll-progress]");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle("is-scrolled", y > 8);
      if (progressBar) {
        var doc = document.documentElement;
        var max = doc.scrollHeight - doc.clientHeight;
        var pct = max > 0 ? Math.min(1, y / max) : 0;
        progressBar.style.transform = "scaleX(" + pct + ")";
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- floating CTA ---------- */
  (function () {
    var floatBtn = document.querySelector("[data-floating-cta]");
    var hero = document.querySelector(".hero");
    var footer = document.querySelector(".site-footer");
    if (!floatBtn || !hero || !("IntersectionObserver" in window)) return;
    var pastHero = false;
    var footerVisible = false;
    function update() { floatBtn.classList.toggle("is-visible", pastHero && !footerVisible); }
    new IntersectionObserver(function (entries) {
      var entry = entries[0];
      pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      update();
    }, { threshold: 0 }).observe(hero);
    if (footer) {
      new IntersectionObserver(function (entries) {
        footerVisible = entries[0].isIntersecting;
        update();
      }, { threshold: 0 }).observe(footer);
    }
  })();

  /* ---------- count-up stats ---------- */
  (function () {
    var statStrip = document.querySelector(".stat-strip");
    if (!statStrip || !("IntersectionObserver" in window)) return;
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function animateCount(el) {
      var target = parseFloat(el.dataset.countTarget);
      var start = parseFloat(el.dataset.countStart || "0");
      var suffix = el.dataset.suffix || "";
      if (reduceMotion || isNaN(target)) { el.textContent = target + suffix; return; }
      var duration = 1400;
      var t0 = performance.now();
      function tick(now) {
        var p = Math.min(1, (now - t0) / duration);
        var eased = easeOutCubic(p);
        var val = Math.round(start + (target - start) * eased);
        el.textContent = val + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll("[data-count-target]").forEach(animateCount);
          o.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    obs.observe(statStrip);
  })();

  /* ---------- hero mini-game ---------- */
  (function () {
    var rackEl = document.querySelector("[data-demo-rack]");
    var guessEl = document.querySelector("[data-demo-guess]");
    var placeholderEl = document.querySelector("[data-demo-placeholder]");
    var feedbackEl = document.querySelector("[data-demo-feedback]");
    var progressEl = document.querySelector("[data-demo-progress]");
    var foundEl = document.querySelector("[data-demo-found]");
    var shuffleBtn = document.querySelector("[data-demo-shuffle]");
    if (!rackEl) return;

    var RACK = [
      { letter: "D", value: 2 }, { letter: "O", value: 1 }, { letter: "R", value: 1 },
      { letter: "A", value: 1 }, { letter: "S", value: 1 }, { letter: "T", value: 1 }, { letter: "E", value: 1 }
    ];
    var WORDS = { ROAD: 5, TOAD: 5, STAR: 4, ROAST: 5, STARE: 5, STORE: 5, ORATES: 6, ROASTED: 8 };
    var TOTAL = Object.keys(WORDS).length;
    var guess = [];
    var found = new Set();
    var clearTimer = null;

    function shuffleArray(arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    function renderRack() {
      rackEl.innerHTML = "";
      shuffleArray(RACK).forEach(function (t) {
        var rot = (Math.random() * 10 - 5).toFixed(1);
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "demo-tile";
        btn.dataset.letter = t.letter;
        btn.style.setProperty("--rot", rot + "deg");
        btn.disabled = guess.indexOf(t.letter) > -1;
        btn.innerHTML = '<span class="letter">' + t.letter + '</span><span class="value">' + t.value + "</span>";
        rackEl.appendChild(btn);
      });
    }

    function updateGuessDisplay() {
      guessEl.querySelectorAll(".demo-guess-letter").forEach(function (n) { n.remove(); });
      placeholderEl.style.display = guess.length ? "none" : "";
      guess.forEach(function (letter) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "demo-guess-letter";
        b.dataset.letter = letter;
        b.setAttribute("aria-label", "Remove " + letter);
        b.textContent = letter;
        guessEl.appendChild(b);
      });
    }

    function setFeedback(text, good) {
      feedbackEl.textContent = text;
      feedbackEl.classList.toggle("is-good", !!good);
    }

    function updateProgress() {
      progressEl.textContent = found.size + " of " + TOTAL + " found";
    }

    function addFoundChip(word, score) {
      var chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = word + " · " + score;
      foundEl.appendChild(chip);
    }

    function resetTiles() {
      rackEl.querySelectorAll(".demo-tile").forEach(function (b) { b.disabled = false; });
      guess = [];
      updateGuessDisplay();
    }

    function scheduleClear(delay) {
      clearTimeout(clearTimer);
      clearTimer = setTimeout(resetTiles, delay);
    }

    function handleTileClick(letter, btn) {
      guess.push(letter);
      btn.disabled = true;
      updateGuessDisplay();
      var word = guess.join("");
      if (WORDS[word] !== undefined) {
        if (found.has(word)) {
          setFeedback("Already found " + word + " — try another combination.", false);
          scheduleClear(900);
        } else {
          found.add(word);
          addFoundChip(word, WORDS[word]);
          updateProgress();
          if (found.size === TOTAL) {
            setFeedback("All " + TOTAL + " found! Shuffle to play again, or try the real solver.", true);
          } else {
            setFeedback(word + " — nice, worth " + WORDS[word] + " points.", true);
          }
          scheduleClear(900);
        }
      } else if (guess.length >= RACK.length) {
        setFeedback("No match in this rack — tap Shuffle to reset.", false);
        scheduleClear(900);
      } else {
        setFeedback("Keep going, or tap a letter above to remove it.", false);
      }
    }

    rackEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".demo-tile");
      if (!btn || btn.disabled) return;
      handleTileClick(btn.dataset.letter, btn);
    });

    guessEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".demo-guess-letter");
      if (!btn) return;
      var letter = btn.dataset.letter;
      var idx = guess.lastIndexOf(letter);
      if (idx > -1) guess.splice(idx, 1);
      var tile = rackEl.querySelector('.demo-tile[data-letter="' + letter + '"]');
      if (tile) tile.disabled = false;
      updateGuessDisplay();
      setFeedback("Letter removed — keep building.", false);
    });

    if (shuffleBtn) {
      shuffleBtn.addEventListener("click", function () {
        clearTimeout(clearTimer);
        guess = [];
        renderRack();
        updateGuessDisplay();
        setFeedback("Find as many real words as you can from this rack.", false);
        if (!reduceMotion) {
          shuffleBtn.classList.add("is-spinning");
          setTimeout(function () { shuffleBtn.classList.remove("is-spinning"); }, 420);
        }
      });
    }

    renderRack();
    updateGuessDisplay();
    updateProgress();
  })();

  /* ---------- how-it-works stepper + pipeline ---------- */
  (function () {
    var stepBtns = document.querySelectorAll("[data-step]");
    if (!stepBtns.length) return;
    var nodes = document.querySelectorAll("[data-node]");
    var fills = document.querySelectorAll("[data-fill]");
    var details = document.querySelectorAll("[data-step-detail]");
    var current = 0;
    var autoTimer = null;

    function setStep(i) {
      current = i;
      stepBtns.forEach(function (b) { b.classList.toggle("is-active", +b.dataset.step === i); });
      nodes.forEach(function (n) {
        var idx = +n.dataset.node;
        n.classList.toggle("is-active", idx === i);
        n.classList.toggle("is-done", idx < i);
      });
      fills.forEach(function (f, idx) { f.style.transform = idx < i ? "scaleX(1)" : "scaleX(0)"; });
      details.forEach(function (d) { d.classList.toggle("is-active", +d.dataset.stepDetail === i); });
    }

    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

    stepBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        stopAuto();
        setStep(+btn.dataset.step);
      });
    });

    setStep(0);

    if (!reduceMotion) {
      autoTimer = setInterval(function () { setStep((current + 1) % stepBtns.length); }, 4500);
      var pipeline = document.querySelector("[data-pipeline]");
      [pipeline, document.querySelector("[data-step-list]")].forEach(function (el) {
        if (el) {
          el.addEventListener("pointerenter", stopAuto, { once: true });
          el.addEventListener("focusin", stopAuto, { once: true });
        }
      });
    }
  })();

  /* ---------- accordion ---------- */
  document.querySelectorAll("[data-accordion] .accordion-trigger").forEach(function (trigger) {
    var panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;
    trigger.addEventListener("click", function () {
      var expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!expanded));
      if (!expanded) {
        var target = panel.querySelector(".accordion-panel-inner").scrollHeight;
        panel.style.height = target + "px";
        panel.addEventListener("transitionend", function handler() {
          panel.style.height = "auto";
          panel.removeEventListener("transitionend", handler);
        }, { once: true });
      } else {
        panel.style.height = panel.scrollHeight + "px";
        requestAnimationFrame(function () { panel.style.height = "0px"; });
      }
    });
  });

  /* ---------- contact channel picker ---------- */
  (function () {
    var picker = document.querySelector("[data-channel-picker]");
    if (!picker) return;
    var btns = picker.querySelectorAll("[data-channel-btn]");
    var panels = picker.querySelectorAll("[data-channel-panel]");
    var cards = document.querySelectorAll("[data-channel-card]");

    function setChannel(key) {
      btns.forEach(function (b) {
        var active = b.dataset.channelBtn === key;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      panels.forEach(function (p) { p.classList.toggle("is-active", p.dataset.channelPanel === key); });
      cards.forEach(function (c) { c.classList.toggle("is-highlighted", c.dataset.channelCard === key); });
    }

    btns.forEach(function (btn) {
      btn.addEventListener("click", function () { setChannel(btn.dataset.channelBtn); });
    });

    setChannel("email");
  })();

  /* ---------- comparison toggle ---------- */
  (function () {
    var toggleBtn = document.querySelector("[data-compare-toggle]");
    if (!toggleBtn) return;
    var extras = document.querySelectorAll(".compare-row.is-extra");
    toggleBtn.addEventListener("click", function () {
      var willShow = !extras[0].classList.contains("is-shown");
      extras.forEach(function (r) { r.classList.toggle("is-shown", willShow); });
      toggleBtn.textContent = willShow ? "Show fewer comparisons" : "Show 5 more comparisons";
    });
  })();

  /* ---------- flip cards (touch fallback) ---------- */
  document.querySelectorAll(".flip-card").forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (e.target.closest("a")) return;
      card.classList.toggle("is-flipped");
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.classList.toggle("is-flipped");
      }
    });
  });

  /* ---------- copy to clipboard ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.dataset.copy;
      var done = function () {
        var label = btn.querySelector("[data-copy-label]");
        var original = label.textContent;
        label.textContent = "Copied!";
        btn.classList.add("is-copied");
        setTimeout(function () { label.textContent = original; btn.classList.remove("is-copied"); }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  });
  function fallbackCopy(text, cb) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* no-op */ }
    document.body.removeChild(ta);
    cb();
  }

  /* ---------- GSAP scroll reveals (progressive enhancement) ---------- */
  function initScrollReveals() {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      var items = group.querySelectorAll("[data-reveal-item]");
      if (!items.length) return;
      var stagger = (parseInt(group.dataset.stagger, 10) || 60) / 1000;
      gsap.set(items, { opacity: 0, y: 24 });
      gsap.to(items, {
        opacity: 1, y: 0, duration: 0.65, ease: "power3.out", stagger: stagger,
        scrollTrigger: { trigger: group, start: "top 82%", once: true }
      });
    });
    document.querySelectorAll("[data-reveal-item]").forEach(function (el) {
      if (el.closest("[data-reveal-group]")) return;
      gsap.set(el, { opacity: 0, y: 24 });
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.65, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true }
      });
    });
  }
  initScrollReveals();
})();
