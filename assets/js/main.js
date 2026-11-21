/**
 * Nithinlabs site interactions.
 * Contact form: set FORM_ENDPOINT to a Formspree (or similar) URL; falls back to mailto.
 */
(function () {
  'use strict';

  var FORM_ENDPOINT = '';
  var CONTACT_EMAIL = 'hello@nithinlabs.tech';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* Always open at the top unless the URL has a hash target */
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  var pinToTop = function () {
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  };
  pinToTop();
  window.addEventListener('load', pinToTop);
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) pinToTop();
  });

  function onVisible(el, cb, threshold) {
    if (!('IntersectionObserver' in window)) {
      cb();
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            io.disconnect();
            cb();
          }
        });
      },
      { threshold: threshold || 0.3 }
    );
    io.observe(el);
  }

  /* Scroll progress */
  var progress = document.querySelector('.scroll-progress');
  if (progress && !reduceMotion) {
    var onScrollProgress = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      progress.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScrollProgress, { passive: true });
    onScrollProgress();
  }

  /* Header: scrolled state + mobile hide-on-scroll */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var lastScrollY = window.scrollY;
  var mobileMq = window.matchMedia('(max-width: 720px)');
  if (header) {
    var setScrolled = function () {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 8);
      if (!reduceMotion && mobileMq.matches && !header.classList.contains('nav-open')) {
        var goingDown = y > lastScrollY && y > 80;
        header.classList.toggle('is-hidden', goingDown);
      } else {
        header.classList.remove('is-hidden');
      }
      lastScrollY = y;
    };
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }
  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* Headline reveal */
  document.querySelectorAll('h1[aria-label]').forEach(function (h1) {
    if (reduceMotion) {
      h1.classList.add('is-in');
      return;
    }
    requestAnimationFrame(function () {
      h1.classList.add('is-in');
    });
  });

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window && !reduceMotion) {
    var rio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            rio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) {
      rio.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-in');
    });
  }

  /* Section line draw-ins */
  document.querySelectorAll('[data-section]').forEach(function (sec) {
    onVisible(
      sec,
      function () {
        sec.classList.add('is-drawn');
      },
      0.15
    );
  });

  /* Pointer spotlight on hairline cards + hero */
  var hero = document.querySelector('[data-hero]');
  document.addEventListener(
    'pointermove',
    function (e) {
      var el = e.target.closest && e.target.closest('.svc-row, .cell');
      if (el) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', e.clientX - r.left + 'px');
        el.style.setProperty('--my', e.clientY - r.top + 'px');
      }
      if (hero && finePointer && !reduceMotion) {
        var hr = hero.getBoundingClientRect();
        var x = ((e.clientX - hr.left) / hr.width) * 100;
        var y = ((e.clientY - hr.top) / hr.height) * 100;
        hero.style.setProperty('--spot-x', x + '%');
        hero.style.setProperty('--spot-y', y + '%');
      }
    },
    { passive: true }
  );

  /* Magnetic primary buttons */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        var max = 6;
        var tx = Math.max(-max, Math.min(max, dx * 0.15));
        var ty = Math.max(-max, Math.min(max, dy * 0.2));
        btn.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* Hub */
  var hub = document.querySelector('[data-hub]');
  var hubTip = document.querySelector('[data-hub-tip]');
  var tips = {
    billing: 'Invoice on every sale',
    stock: 'Inventory adjusts live',
    payments: 'UPI settles and reconciles',
    crm: 'Loyalty and follow-ups fire',
    website: 'Orders land in the same stack',
  };

  function pulseHub(id) {
    if (!hub || !id) return;
    hub.querySelectorAll('.is-hot').forEach(function (el) {
      el.classList.remove('is-hot');
    });
    var link = hub.querySelector('[data-link="' + id + '"]');
    var node = hub.querySelector('[data-node="' + id + '"]');
    var orbitNode = hub.querySelector('[data-orbit-node="' + id + '"]');
    if (link) {
      link.classList.add('is-hot');
      setTimeout(function () {
        link.classList.remove('is-hot');
      }, 1400);
    }
    if (node) {
      node.classList.add('is-hot');
      setTimeout(function () {
        node.classList.remove('is-hot');
      }, 1400);
    }
    if (orbitNode) {
      orbitNode.classList.add('is-hot');
      setTimeout(function () {
        orbitNode.classList.remove('is-hot');
      }, 1400);
    }
    if (hubTip && tips[id]) hubTip.textContent = tips[id];
  }

  var story = document.querySelector('[data-story]');
  var storySteps = story
    ? Array.prototype.slice.call(story.querySelectorAll('[data-story-step]'))
    : [];
  var flowDots = document.querySelector('[data-flow-dots]');
  var activeStoryId = '';

  function setStoryActive(id, pulse) {
    if (!id) return;
    storySteps.forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-story-step') === id);
    });
    if (flowDots) {
      var idx = storySteps.findIndex(function (el) {
        return el.getAttribute('data-story-step') === id;
      });
      Array.prototype.forEach.call(flowDots.children, function (dot, i) {
        dot.classList.toggle('is-active', i === idx);
      });
    }
    if (hub) {
      hub.querySelectorAll('[data-link], [data-node], [data-orbit-node]').forEach(function (el) {
        var match =
          el.getAttribute('data-link') === id ||
          el.getAttribute('data-node') === id ||
          el.getAttribute('data-orbit-node') === id;
        el.classList.toggle('is-active', match);
      });
    }
    if (hubTip && tips[id]) hubTip.textContent = tips[id];
    if (pulse && id !== activeStoryId) pulseHub(id);
    activeStoryId = id;
  }

  if (hub) {
    hub.querySelectorAll('[data-node]').forEach(function (node) {
      var id = node.getAttribute('data-node');
      var activate = function () {
        setStoryActive(id, true);
      };
      node.addEventListener('mouseenter', activate);
      node.addEventListener('focus', activate);
    });
    document.querySelectorAll('[data-flow]').forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        setStoryActive(item.getAttribute('data-flow'), true);
      });
    });
  }

  /* Desktop scroll story + mobile snap carousel */
  if (story && storySteps.length && !reduceMotion) {
    var desktopStoryMq = window.matchMedia('(min-width: 960px)');
    var onStoryScroll = function (e) {
      if (!desktopStoryMq.matches) return;
      var detail = e && e.detail;
      var p = detail && typeof detail.progress === 'number' ? detail.progress : 0;
      var step = window.NLScroll
        ? window.NLScroll.stepFor(p, storySteps.length)
        : Math.min(storySteps.length - 1, Math.floor(p * storySteps.length));
      var id = storySteps[step] && storySteps[step].getAttribute('data-story-step');
      if (id && id !== activeStoryId) setStoryActive(id, true);
    };
    story.addEventListener('nl:scroll', onStoryScroll);

    var flowList = story.querySelector('.flow-list');
    if (flowList && 'IntersectionObserver' in window) {
      var cardIo = new IntersectionObserver(
        function (entries) {
          if (desktopStoryMq.matches) return;
          var best = null;
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
          });
          if (best && best.target.getAttribute('data-story-step')) {
            setStoryActive(best.target.getAttribute('data-story-step'), true);
          }
        },
        { root: flowList, threshold: 0.6 }
      );
      storySteps.forEach(function (el) {
        cardIo.observe(el);
      });
    }

    if (storySteps[0]) setStoryActive(storySteps[0].getAttribute('data-story-step'), false);
  } else if (storySteps[0]) {
    setStoryActive(storySteps[0].getAttribute('data-story-step'), false);
  }

  /* Mobile sticky CTA */
  var mobileCta = document.querySelector('[data-mobile-cta]');
  var heroEl = document.querySelector('[data-hero]');
  var footerEl = document.querySelector('.site-footer');
  if (mobileCta && heroEl && mobileMq.matches !== undefined) {
    var syncCta = function () {
      if (!mobileMq.matches) {
        mobileCta.hidden = true;
        mobileCta.classList.remove('is-visible');
        return;
      }
      var pastHero = window.scrollY > (heroEl.offsetHeight || 400) * 0.55;
      var nearFooter = false;
      if (footerEl) {
        var fr = footerEl.getBoundingClientRect();
        nearFooter = fr.top < window.innerHeight - 40;
      }
      var show = pastHero && !nearFooter;
      mobileCta.hidden = !show;
      mobileCta.classList.toggle('is-visible', show);
    };
    syncCta();
    window.addEventListener('scroll', syncCta, { passive: true });
    window.addEventListener('resize', syncCta, { passive: true });
  }

  /* Mobile tabs: center selected chip horizontally without scrolling the page */
  function centerTabInList(list, tab) {
    if (!list || !tab) return;
    var target =
      tab.offsetLeft - (list.clientWidth / 2) + (tab.offsetWidth / 2);
    var max = Math.max(0, list.scrollWidth - list.clientWidth);
    list.scrollLeft = Math.max(0, Math.min(max, target));
  }
  document.querySelectorAll('[data-tabs] .tab-list').forEach(function (list) {
    var selected = list.querySelector('[aria-selected="true"]');
    if (selected && window.matchMedia('(max-width: 959px)').matches) {
      centerTabInList(list, selected);
    }
  });

  /* Live sale demo */
  var demo = document.querySelector('[data-demo]');
  if (demo) {
    var runBtn = demo.querySelector('[data-demo-run]');
    var runLabel = runBtn.querySelector('span');
    var status = demo.querySelector('[data-demo-status]');
    var stockEl = demo.querySelector('[data-demo-stock]');
    var salesEl = demo.querySelector('[data-demo-sales]');
    var invEl = demo.querySelector('[data-demo-invoices]');
    var steps = Array.prototype.slice.call(demo.querySelectorAll('[data-step]'));
    var state = { stock: 24, sales: 18420, invoices: 41, invNo: 2041, points: 120, running: false };
    var PRICE = 649;
    var TAX_RATE = 0.05;

    var rupees = function (n) {
      return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    };

    var bump = function (el, text) {
      el.textContent = text;
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
    };

    var run = function () {
      if (state.running) return;
      state.running = true;
      runBtn.disabled = true;
      if (state.stock <= 1) state.stock = 24;

      steps.forEach(function (s) {
        s.classList.remove('is-done', 'is-active');
        s.querySelector('[data-v]').textContent = '';
      });

      var taxable = PRICE / (1 + TAX_RATE);
      var taxAmt = (PRICE - taxable).toFixed(2);
      var invNo = ++state.invNo;
      var before = state.stock;
      state.points += 6;

      var values = [
        'Counter 01 · ' + rupees(PRICE),
        'Basmati 5 kg · ' + before + ' → ' + (before - 1) + ' left',
        'INV-' + invNo + ' · Tax ₹' + taxAmt,
        'UPI via Razorpay · captured',
        'WhatsApp receipt · ' + state.points + ' pts',
      ];
      var effects = [
        function () {
          state.sales += PRICE;
          bump(salesEl, rupees(state.sales));
        },
        function () {
          state.stock -= 1;
          bump(stockEl, String(state.stock));
        },
        function () {
          state.invoices += 1;
          bump(invEl, String(state.invoices));
        },
        null,
        null,
      ];

      var delay = reduceMotion ? 0 : 650;
      var i = 0;
      var next = function () {
        if (i > 0) {
          steps[i - 1].classList.remove('is-active');
          steps[i - 1].classList.add('is-done');
          if (effects[i - 1]) effects[i - 1]();
        }
        if (i === steps.length) {
          state.running = false;
          runBtn.disabled = false;
          runLabel.textContent = 'Ring up another sale';
          status.textContent = 'Sale complete. Stock, invoice, payment and CRM updated.';
          return;
        }
        steps[i].classList.add('is-active');
        steps[i].querySelector('[data-v]').textContent = values[i];
        i += 1;
        setTimeout(next, delay);
      };
      next();
    };

    runBtn.addEventListener('click', run);
    onVisible(
      demo,
      function () {
        setTimeout(run, reduceMotion ? 0 : 900);
      },
      0.5
    );
  }

  /* Tabs + sliding indicator */
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var indicator = root.querySelector('.tab-indicator');

    var moveIndicator = function (tab) {
      if (!indicator || !tab || window.innerWidth < 960) return;
      var list = tab.parentElement;
      var top = tab.offsetTop + tab.offsetHeight - 1;
      indicator.style.transform = 'translateY(' + top + 'px)';
    };

    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      moveIndicator(tab);
      if (focus) tab.focus();
      // Pause / resume visuals
      root.querySelectorAll('.viz').forEach(function (v) {
        v.classList.add('is-paused');
      });
      var activePanel = document.getElementById(tab.getAttribute('aria-controls'));
      if (activePanel) {
        activePanel.querySelectorAll('.viz').forEach(function (v) {
          v.classList.remove('is-paused');
        });
      }
    };

    tabs.forEach(function (tab, idx) {
      tab.addEventListener('click', function () {
        select(tab, false);
      });
      tab.addEventListener('keydown', function (e) {
        var to = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') to = tabs[(idx + 1) % tabs.length];
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') to = tabs[(idx - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') to = tabs[0];
        if (e.key === 'End') to = tabs[tabs.length - 1];
        if (to) {
          e.preventDefault();
          select(to, true);
        }
      });
    });

    var initial = tabs.find(function (t) {
      return t.getAttribute('aria-selected') === 'true';
    });
    if (initial) select(initial, false);
    window.addEventListener('resize', function () {
      if (initial) moveIndicator(root.querySelector('[aria-selected="true"]') || initial);
    });
  });

  /* Pause off-screen looping visuals */
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('is-paused', !entry.isIntersecting);
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll('.viz, .hub-svg, .orbit-svg').forEach(function (el) {
      vio.observe(el);
    });
  }

  /* Process steps (legacy, if present) */
  var stepsRoot = document.querySelector('[data-steps]');
  if (stepsRoot && !reduceMotion) {
    var stepEls = Array.prototype.slice.call(stepsRoot.querySelectorAll('.step'));
    var current = 0;
    var timer = null;
    var paint = function () {
      stepEls.forEach(function (s, i) {
        s.classList.toggle('is-current', i === current);
      });
    };
    var start = function () {
      stop();
      timer = setInterval(function () {
        current = (current + 1) % stepEls.length;
        paint();
      }, 2400);
    };
    var stop = function () {
      if (timer) clearInterval(timer);
      timer = null;
    };
    stepEls.forEach(function (s, i) {
      s.addEventListener('mouseenter', function () {
        stop();
        current = i;
        paint();
      });
    });
    stepsRoot.addEventListener('mouseleave', start);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              paint();
              start();
            } else {
              stop();
            }
          });
        },
        { threshold: 0.4 }
      ).observe(stepsRoot);
    }
  }

  /* Stat / door counters + sparkline */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = Number(el.getAttribute('data-count')) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var card = el.closest('.door, .stat, .reward-card');
    var format = function (n) {
      return prefix + n + suffix;
    };
    if (reduceMotion) {
      el.textContent = format(target);
      if (card) card.classList.add('is-in');
      return;
    }
    onVisible(
      el,
      function () {
        if (card) card.classList.add('is-in');
        var t0 = performance.now();
        var tick = function (now) {
          var p = Math.min(1, (now - t0) / 1400);
          el.textContent = format(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      0.5
    );
  });

  /* Services filter */
  var filter = document.getElementById('service-filter');
  if (filter) {
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var pillars = Array.prototype.slice.call(document.querySelectorAll('[data-pillar]'));
    var count = document.querySelector('[data-filter-count]');
    var empty = document.querySelector('[data-filter-empty]');
    var apply = function () {
      var q = filter.value.trim().toLowerCase();
      var shown = 0;
      rows.forEach(function (row) {
        var hit = !q || row.getAttribute('data-search').indexOf(q) !== -1;
        row.hidden = !hit;
        if (hit) shown += 1;
      });
      pillars.forEach(function (p) {
        p.hidden = !p.querySelector('[data-search]:not([hidden])');
      });
      if (count) count.textContent = shown + ' of ' + rows.length + ' services';
      if (empty) empty.textContent = shown ? '' : 'No services match “' + filter.value.trim() + '”. Try “billing”, “UPI” or “stock”.';
    };
    filter.addEventListener('input', apply);
    apply();
  }

  /* Module picker */
  var stack = document.querySelector('[data-stack]');
  var estimate = document.querySelector('[data-stack-estimate]');
  var selectedModules = function () {
    if (!stack) return [];
    return Array.prototype.slice
      .call(stack.querySelectorAll('input[type="checkbox"]:checked'))
      .map(function (b) {
        return b.value;
      });
  };
  if (stack && estimate) {
    var updateEstimate = function () {
      var n = selectedModules().length;
      var text;
      if (n === 0) text = 'Pick modules to see a suggested rollout';
      else if (n <= 2) text = '<strong>Single release</strong> · typically 3–6 weeks';
      else if (n <= 4) text = '<strong>Two phases</strong> · typically 6–10 weeks';
      else text = '<strong>Phased rollout</strong> · 3+ months, value from phase one';
      estimate.innerHTML = text;
    };
    stack.addEventListener('change', updateEstimate);
    updateEstimate();
  }

  /* Contact form */
  var form = document.getElementById('contact-form');
  if (form) {
    var message = document.getElementById('form-message');
    var show = function (text, type) {
      message.textContent = text;
      message.className = 'form-message show ' + type;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.querySelectorAll('.field-error').forEach(function (el) {
        el.classList.remove('field-error');
      });

      var name = form.querySelector('#name');
      var email = form.querySelector('#email');
      var phone = form.querySelector('#phone');
      var company = form.querySelector('#company');
      var details = form.querySelector('#message');
      var valid = true;

      [name, email, details].forEach(function (f) {
        if (!f.value.trim()) {
          f.classList.add('field-error');
          valid = false;
        }
      });
      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.classList.add('field-error');
        valid = false;
      }
      if (!valid) {
        show('Please fill in your name, a valid email and a short message.', 'error');
        var firstBad = form.querySelector('.field-error');
        if (firstBad) firstBad.focus();
        return;
      }

      var payload = {
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        company: company.value.trim(),
        modules: selectedModules(),
        message: details.value.trim(),
      };

      var mailto = function () {
        var subject = encodeURIComponent('Nithinlabs enquiry — ' + (payload.company || payload.name));
        var body = encodeURIComponent(
          'Name: ' +
            payload.name +
            '\nEmail: ' +
            payload.email +
            '\nPhone: ' +
            payload.phone +
            '\nCompany: ' +
            payload.company +
            '\nModules: ' +
            (payload.modules.join(', ') || '—') +
            '\n\n' +
            payload.message
        );
        window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
        show('Opening your email app with the enquiry filled in.', 'success');
      };

      if (!FORM_ENDPOINT) {
        mailto();
        return;
      }

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          show('Thanks — we’ll reply within one business day.', 'success');
          form.reset();
          if (estimate && stack) stack.dispatchEvent(new Event('change'));
        })
        .catch(mailto);
    });
  }
})();
